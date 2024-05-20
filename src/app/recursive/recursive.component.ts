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
    return item.children?.length
        ? item.children.map(flatten).reduce((arr, item) => [...arr, ...item], [])
        : [item];
}

@Component({
    selector: 'recursive',
    templateUrl: './recursive.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./recursive.component.less']
})
export class RecursiveComponent {
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

       return  nodes
            .map(node => this.markAndFilterNode(node, searchTerm))
            .filter(node => node.highlight || (node.children && node.children.length > 0));

   
    }

    private markAndFilterNode(node: TreeNode, searchTerm: string): TreeNode {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const highlight = node.name.toLowerCase().includes(lowerSearchTerm);

        const markedChildren = (node.children || [])
            .map(child => this.markAndFilterNode(child, searchTerm))
            .filter(child => child.highlight || child.children?.length);

        const expanded = highlight || markedChildren.length > 0;

        return { ...node, children: markedChildren, highlight, expanded: expanded ?? false }; 
   }

    highlightSearchTerm(name: string, searchTerm: string): string {
        if (!searchTerm) {
            return name;
        }
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return name.replace(regex, '<span class="highlight">$1</span>');
    }
}



