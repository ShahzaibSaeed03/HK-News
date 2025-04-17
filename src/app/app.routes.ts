import { Routes } from '@angular/router';
import { ArticleComponent } from './components/article/article.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/authentication/login/login.component';
import { RegisterComponent } from './components/authentication/register/register.component';
import { VideoNewsComponent } from './components/video-news/video-news.component';
import { BusinessComponent } from './components/business/business.component';
import { CelebirtyComponent } from './components/celebirty/celebirty.component';
import { CrimeComponent } from './components/crime/crime.component';
import { EntertainmentComponent } from './components/entertainment/entertainment.component';
import { PoliticsComponent } from './components/politics/politics.component';
import { MyProfileComponent } from './components/my-profile/my-profile.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';


export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {path:"video-news/:type/:slug",
        component:VideoNewsComponent
    },
    { path: 'article/:type/:slug', component: ArticleComponent },

    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'business-news',
        component: BusinessComponent
    },
    {
      path:'crime-news' ,
      component:CrimeComponent
    },
    {
        path:'politics-news' ,
        component:PoliticsComponent
      },
      {
        path:'entertainment-news' ,
        component:EntertainmentComponent
      },
      {
        path:'celebirty-news' ,
        component:CelebirtyComponent
      },
      {
        path:"my-profile",
        component:MyProfileComponent
      }
,
{ path: 'edit-profile', component: EditProfileComponent },

];
