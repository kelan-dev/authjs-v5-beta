export type SuccessResult<T = undefined> = {
  success: true;
  message?: string;
  data?: T;
};

export type ErrorResult<E = unknown> = {
  success: false;
  message?: string;
  error?: E;
};

export type Result<T = undefined, E = unknown> =
  | SuccessResult<T>
  | ErrorResult<E>;

export const Result = {
  success: <T = undefined>(params?: {
    message?: string;
    data?: T;
  }): SuccessResult<T> => ({
    success: true,
    ...(params?.message !== undefined && { message: params.message }),
    ...(params?.data !== undefined && { data: params.data }),
  }),

  error: <E = unknown>(params?: {
    message?: string;
    error?: E;
  }): ErrorResult<E> => ({
    success: false,
    ...(params?.message !== undefined && { message: params.message }),
    ...(params?.error !== undefined && { error: params.error }),
  }),

  fromPromise: async <T>(promise: Promise<T>): Promise<Result<T>> => {
    try {
      const data = await promise;
      return Result.success({ data });
    } catch (error) {
      return Result.error({
        message: error instanceof Error ? error.message : "An error occurred",
        error: error instanceof Error ? { stack: error.stack } : undefined,
      });
    }
  },
};

type Serializable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Serializable[]
  | { [key: string]: Serializable };

export function serializable<T>(value: T): Serializable {
  try {
    return JSON.parse(
      JSON.stringify(value, (_, v) => {
        if (typeof v === "bigint") {
          return v.toString();
        }
        if (typeof v === "number" && !isFinite(v)) {
          return v.toString();
        }
        return v;
      }),
    );
  } catch (error) {
    console.warn("Serialization failed:", error);
    if (error instanceof TypeError && error.message.includes("circular")) {
      return {
        error: "Serialization failed",
        message: "Object contains circular reference",
        type: "CircularStructureError",
      };
    }
    return {
      error: "Serialization failed",
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
