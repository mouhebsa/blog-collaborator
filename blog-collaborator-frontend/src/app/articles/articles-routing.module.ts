import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { ArticleFormComponent } from './components/article-form/article-form.component';
import { ArticleDetailComponent } from './components/article-detail/article-detail'; // Corrected import name

const routes: Routes = [
  { path: '', component: ArticleListComponent },
  { path: 'new', component: ArticleFormComponent },
  { path: 'edit/:id', component: ArticleFormComponent },
  { path: ':id', component: ArticleDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArticlesRoutingModule {}
