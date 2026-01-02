import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
selector: 'app-shell',
standalone: true,
imports: [RouterOutlet, RouterLink],
templateUrl: './shell.html',
styleUrl: './shell.scss'
})
export class Shell {}
