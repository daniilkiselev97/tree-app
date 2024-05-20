import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EMPTY_ARRAY, TuiHandler } from '@taiga-ui/cdk';
import { Observable, combineLatest } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { JsonDataService } from '../json-data.service';

interface TreeNode {
    readonly id: string;
    readonly children?: readonly TreeNode[];
    readonly name: string;
    highlight?: boolean;
    expanded?: boolean;
}

function flatten(item: TreeNode): readonly TreeNode[] {
    const stack = [item];
    const result: TreeNode[] = [];
    while (stack.length) {
        const node = stack.pop();
        if (node) {
            result.push(node);
            if (node.children) {
                stack.push(...node.children);
            }
        }
    }
    return result;
}

@Component({
    selector: 'stack',
    templateUrl: './stack.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./stack.component.less']
})
export class StackComponent {
    constructor(
        private readonly jsonDataService: JsonDataService,
    ) {}

    map = new Map<TreeNode, boolean>();

    readonly searchForm = new FormGroup({
        formValue: new FormControl(''),
    });

    readonly data$: Observable<TreeNode[]> = this.jsonDataService.getData();

    readonly filteredData$ = combineLatest([
        this.data$,
        this.searchForm.get('formValue')!.valueChanges.pipe(startWith(''))
    ]).pipe(
        map(([data, searchTerm]) => this.markAndFilterTreeNodes(data, searchTerm ?? ''))
    );

    readonly handler: TuiHandler<TreeNode, readonly TreeNode[]> = item =>
        item.children ?? EMPTY_ARRAY;

    readonly getValue = (item: TreeNode, map: Map<TreeNode, boolean>): boolean | null => {
        const flat = flatten(item);
        const result = !!map.get(flat[0]);

        for (const item of flat) {
            if (result !== !!map.get(item)) {
                return null;
            }
        }

        return result;
    };

    onChecked(node: TreeNode, value: boolean): void {
        flatten(node).forEach(item => this.map.set(item, value));
        this.map = new Map(this.map.entries());
    }

    private markAndFilterTreeNodes(nodes: TreeNode[], searchTerm: string): TreeNode[] {
        if (!searchTerm) {
            return nodes.map(node => ({ ...node, expanded: false, highlight: false }));
        }

        const result: TreeNode[] = nodes
            .map(node => this.markAndFilterNode(node, searchTerm))
            .filter(node => node.highlight || (node.children && node.children.length > 0));

        return result;
    }

    private markAndFilterNode(node: TreeNode, searchTerm: string): TreeNode {
			const lowerSearchTerm = searchTerm.toLowerCase();
			const stack: TreeNode[] = [node];
			const result: TreeNode[] = [];
	
			while (stack.length) {
					const currentNode = stack.pop()!;
					const highlight = currentNode.name.toLowerCase().includes(lowerSearchTerm);
	
					let children: TreeNode[] = [];
					if (currentNode.children) {
							children = currentNode.children.filter(child => child.name.toLowerCase().includes(lowerSearchTerm));
							children.forEach(child => stack.push(child));
					}
	
					result.push({
							...currentNode,
							children: children.length > 0 ? children : undefined,
							highlight,
							expanded: highlight || children.length > 0
					});
			}
	
			return result[0];
	}
	

    highlightSearchTerm(name: string, searchTerm: string): string {
        if (!searchTerm) {
            return name;
        }
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return name.replace(regex, '<span class="highlight">$1</span>');
    }
}
