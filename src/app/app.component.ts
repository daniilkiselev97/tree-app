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
}

function flatten(item: TreeNode): readonly TreeNode[] {
    return item.children?.length
        ? item.children.map(flatten).reduce((arr, item) => [...arr, ...item], [])
        : [item];
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./app.component.css']
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
        map(([data, searchTerm]) => this.markTreeNodes(data, searchTerm ?? ''))
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

    private markTreeNodes(nodes: TreeNode[], searchTerm: string): TreeNode[] {
        return nodes.map(node => this.markNode(node, searchTerm));
    }

    private markNode(node: TreeNode, searchTerm: string): TreeNode {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const highlight = node.name.toLowerCase().includes(lowerSearchTerm);

        const markedChildren = (node.children || []).map(child => this.markNode(child, searchTerm));

        return { ...node, children: markedChildren, highlight };
    }

    highlightSearchTerm(name: string, searchTerm: string): string {
        if (!searchTerm) {
            return name;
        }
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return name.replace(regex, '<span class="highlight">$1</span>');
    }
}
