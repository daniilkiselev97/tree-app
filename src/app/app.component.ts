import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { JsonDataService } from './json-data.service';
// import { TuiTreeModule } from '@taiga-ui/components';

interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}
// interface Department {
//   name: string;
//   children?: Department[];
// }


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./app.component.css']
})
// export class AppComponent implements OnInit {
// 	data: TreeNode[] = []

// 	constructor(
// 		private readonly _jsonDataService: JsonDataService,
// 		private readonly _cdr: ChangeDetectorRef
// 	){}

// 	ngOnInit(): void {
// 		this._jsonDataService.getData().subscribe((data: TreeNode[]) => {
//       console.log(this.data); 
// 			this.data = data
//       this._cdr.markForCheck(); 
//     });
//   }
  
//   trackById(index: number, item: TreeNode): string {
//     return item.id;
//   }
// }

export class AppComponent implements OnInit {
  data: TreeNode[] = [];

  constructor(
    private readonly jsonDataService: JsonDataService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.jsonDataService.getData().subscribe((data: TreeNode[]) => {
      console.log(data);
      this.data = this.removeDuplicates(data);
      this.cdr.markForCheck();
    });
  }

  trackById(index: number, item: TreeNode): string {
    return item.id;
  }

  removeDuplicates(nodes: TreeNode[]): TreeNode[] {
		const seenIds: Set<string> = new Set();
		const filteredNodes: TreeNode[] = [];
		nodes.forEach(node => this.filterNode(node, seenIds, filteredNodes));
		return filteredNodes;
	}
	
	filterNode(node: TreeNode, seenIds: Set<string>, filteredNodes: TreeNode[]): void {
  if (seenIds.has(node.id)) {
    return; // Если узел уже был обработан, просто завершаем выполнение
  }
  seenIds.add(node.id); // Добавляем идентификатор узла в множество
  filteredNodes.push(node); // Добавляем узел в массив уникальных узлов

  // Рекурсивно обрабатываем дочерние узлы
  node.children.forEach(child => this.filterNode(child, seenIds, filteredNodes));
}
}

