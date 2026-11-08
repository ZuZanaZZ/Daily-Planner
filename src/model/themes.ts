import type { CSSProperties } from 'react';
import type { Theme } from './types';

const base = {
  text: '#3b3340',
  paper: '#ffffff',
  font: '"Nunito", "Segoe UI", system-ui, sans-serif',
};

/** One soft palette per month (index 0 = January). */
export const MONTH_THEMES: Theme[] = [
  { ...base, name: 'Frost', primary: '#6b8fb8', accent: '#a9c4e3', soft: '#eef4fb', line: '#d5e1ee' },
  { ...base, name: 'Rose', primary: '#c46b86', accent: '#f0a8bd', soft: '#fdf0f4', line: '#f0d5de' },
  { ...base, name: 'Mint', primary: '#5d9e86', accent: '#a5d8c3', soft: '#eef9f4', line: '#d3eadf' },
  { ...base, name: 'Lilac', primary: '#8c74b8', accent: '#c7b5e6', soft: '#f5f1fc', line: '#e2d9f0' },
  { ...base, name: 'Blossom', primary: '#c97a9a', accent: '#f4bfd3', soft: '#fdf2f7', line: '#f1dbe5' },
  { ...base, name: 'Sunny', primary: '#c9973a', accent: '#f5d488', soft: '#fdf8ea', line: '#efe3c2' },
  { ...base, name: 'Ocean', primary: '#3f8fa6', accent: '#93d0de', soft: '#ecf7fa', line: '#cfe6ec' },
  { ...base, name: 'Peach', primary: '#d17f5e', accent: '#f6bfa4', soft: '#fef3ed', line: '#f2dccf' },
  { ...base, name: 'Sage', primary: '#7d9165', accent: '#c3d1aa', soft: '#f4f7ee', line: '#e0e7d3' },
  { ...base, name: 'Pumpkin', primary: '#c46f35', accent: '#eeb07f', soft: '#fdf1e8', line: '#f0d9c7' },
  { ...base, name: 'Plum', primary: '#8a5a7a', accent: '#cfa3c0', soft: '#f8eff5', line: '#e8d6e1' },
  { ...base, name: 'Pine', primary: '#4f7a68', accent: '#e0a0a0', soft: '#eef5f1', line: '#d3e3da' },
];

export function themeVars(t: Theme): CSSProperties {
  return {
    '--primary': t.primary,
    '--accent': t.accent,
    '--soft': t.soft,
    '--line': t.line,
    '--text': t.text,
    '--paper': t.paper,
    '--font': t.font,
  } as CSSProperties;
}
