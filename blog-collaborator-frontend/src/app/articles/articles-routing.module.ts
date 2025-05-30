import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { ArticleFormComponent } from './components/article-form/article-form.component';

const routes: Routes = [
  { path: '', component: ArticleListComponent },
  { path: 'new', component: ArticleFormComponent },
  { path: 'edit/:id', component: ArticleFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArticlesRoutingModule {}
