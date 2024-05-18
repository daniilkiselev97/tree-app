import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { JsonDataService } from './json-data.service';

import { EMPTY_ARRAY, TuiHandler } from '@taiga-ui/cdk';
import { Observable } from 'rxjs';

interface TreeNode {
	readonly id: string;
	readonly children?: readonly TreeNode[];
	readonly name: string;
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

	readonly data$: Observable<TreeNode> = this.jsonDataService.getData();

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
}


