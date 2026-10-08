import type { Vector3 } from '../math/Vector';
import type { LinkConfig } from './types';

export class Link {
  readonly id: string;
  readonly name: string;
  readonly length: number;
  readonly offset: Vector3;
  readonly color?: string;
  readonly radius: number;
  readonly mass: number;

  constructor(config: LinkConfig) {
    this.id = config.id;
    this.name = config.name;
    this.length = config.length;
    this.offset = config.offset.clone();
    this.color = config.color;
    this.radius = config.radius ?? 0.04;
    this.mass = config.mass ?? 1.0;
  }
}
