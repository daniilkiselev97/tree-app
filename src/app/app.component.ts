import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JsonDataService } from './json-data.service';
import { EMPTY_ARRAY, TuiHandler } from '@taiga-ui/cdk';
import { Observable, combineLatest } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';

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
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./app.component.less']
})
export class AppComponent {
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

        const result: TreeNode[] = [];
        const stack = [...nodes];

        while (stack.length) {
            const node = stack.pop();
            if (node) {
                const markedNode = this.markAndFilterNode(node, searchTerm);
                if (markedNode.highlight || (markedNode.children && markedNode.children.length > 0)) {
                    result.push(markedNode);
                }
            }
        }

        return result;
    }

		private markAndFilterNode(node: TreeNode, searchTerm: string): TreeNode {
			const lowerSearchTerm = searchTerm.toLowerCase();
			const stack = [node];
			const markedChildren: TreeNode[] = [];
	
			while (stack.length) {
					const currentNode = stack.pop();
					if (currentNode && typeof currentNode === 'object' && !markedChildren.includes(currentNode)) {
							const highlight = currentNode.name.toLowerCase().includes(lowerSearchTerm);
	
							const childrenStack = (currentNode.children || [])
									.map(child => this.markAndFilterNode(child, searchTerm))
									.filter(child => child.highlight || child.children?.length);
	
							if (highlight || childrenStack.length > 0) {
									markedChildren.push({
											...currentNode,
											children: childrenStack,
											highlight,
											expanded: highlight || childrenStack.length > 0,
									});
							}
					}
			}
	
			const highlighted = node.name.toLowerCase().includes(lowerSearchTerm);
			const expanded = highlighted || markedChildren.length > 0;
	
			return { ...node, children: markedChildren, highlight: highlighted, expanded };
	}
	
	

    highlightSearchTerm(name: string, searchTerm: string): string {
        if (!searchTerm) {
            return name;
        }
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return name.replace(regex, '<span class="highlight">$1</span>');
    }
}
