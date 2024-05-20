import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RecursiveComponent } from './recursive/recursive.component';
import { StackComponent } from './stack/stack.component';


const routes: Routes = [
	{ path: 'recursive', component: RecursiveComponent },
	{ path: 'stack', component: StackComponent },
	{ path: '', redirectTo: '/recursive', pathMatch: 'full' }
];

@NgModule({
	declarations: [],
	imports: [
		RouterModule.forRoot(routes)
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
