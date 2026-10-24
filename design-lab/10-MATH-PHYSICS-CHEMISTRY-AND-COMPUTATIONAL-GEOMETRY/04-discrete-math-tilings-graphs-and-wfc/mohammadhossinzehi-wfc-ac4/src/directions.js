// Direction d means "the neighbour at (x + DX[d], y + DY[d])".
// 0 = left, 1 = down, 2 = right, 3 = up (y grows downward, like screen space).
export const DX = [-1, 0, 1, 0];
export const DY = [0, 1, 0, -1];
export const OPPOSITE = [2, 3, 0, 1];
export const DIRECTION_NAMES = ['left', 'down', 'right', 'up'];
