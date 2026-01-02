import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
selector: 'app-shell',
standalone: true,
imports: [CommonModule, RouterOutlet, RouterLink],
templateUrl: './shell.html',
styleUrl: './shell.scss'
})
export class Shell {}
