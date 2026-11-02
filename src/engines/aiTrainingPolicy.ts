/** Remote model repositories may provide executable Python code. */
export const ALLOW_REMOTE_MODEL_CODE_BY_DEFAULT = false;

export function pythonBoolean(value: boolean): "True" | "False" {
  return value ? "True" : "False";
}
