import { Vector3 } from './Vector';
import { Matrix4 } from './Matrix';

export class Transform {
  position: Vector3;
  matrix: Matrix4;

  constructor(position: Vector3 = Vector3.zero(), matrix: Matrix4 = Matrix4.identity()) {
    this.position = position;
    this.matrix = matrix;
  }

  static fromMatrix(matrix: Matrix4): Transform {
    return new Transform(matrix.getPosition(), matrix);
  }

  clone(): Transform {
    return new Transform(this.position.clone(), this.matrix.clone());
  }
}
