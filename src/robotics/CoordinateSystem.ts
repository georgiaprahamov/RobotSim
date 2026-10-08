import { Vector3 } from '../math/Vector';
import { Matrix4 } from '../math/Matrix';

export interface CoordinateFrame {
  name: string;
  origin: Vector3;
  matrix: Matrix4;
  xAxis: Vector3;
  yAxis: Vector3;
  zAxis: Vector3;
}

export class CoordinateSystem {
  /**
   * Extracts orthogonal basis vectors (X, Y, Z axes) from a 4x4 Transformation Matrix
   */
  static getFrame(name: string, matrix: Matrix4): CoordinateFrame {
    const origin = matrix.getPosition();
    const e = matrix.elements;

    // Columns of the rotation submatrix represent X, Y, Z basis unit vectors
    const xAxis = new Vector3(e[0], e[1], e[2]).normalize();
    const yAxis = new Vector3(e[4], e[5], e[6]).normalize();
    const zAxis = new Vector3(e[8], e[9], e[10]).normalize();

    return {
      name,
      origin,
      matrix,
      xAxis,
      yAxis,
      zAxis,
    };
  }

  /**
   * Transforms a point from Frame A to Frame B given their transformation matrices relative to Base
   */
  static transformPointBetweenFrames(
    point: Vector3,
    frameAMatrix: Matrix4,
    frameBMatrix: Matrix4
  ): Vector3 {
    // p_base = T_A * p_A
    const pBase = frameAMatrix.transformPoint(point);
    // p_B = (T_B)^-1 * p_base
    const invB = frameBMatrix.inverseRigid();
    return invB.transformPoint(pBase);
  }
}
