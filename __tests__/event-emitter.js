import { EventEmitter } from "../src/battleship/event-emitter";

describe("EventEmitter", () => {
  let emitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  test("should call listeners when an event is emitted", () => {
    const callback = jest.fn();
    emitter.on("testEvent", callback);

    emitter.emit("testEvent", { data: "testData" });

    expect(callback).toHaveBeenCalledWith({ data: "testData" });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should not call removed listeners", () => {
    const callback = jest.fn();
    emitter.on("testEvent", callback);
    emitter.off("testEvent", callback);

    emitter.emit("testEvent", { data: "testData" });

    expect(callback).not.toHaveBeenCalled();
  });

  test("should handle multiple listeners for the same event", () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    emitter.on("testEvent", callback1);
    emitter.on("testEvent", callback2);

    emitter.emit("testEvent", { data: "testData" });

    expect(callback1).toHaveBeenCalledWith({ data: "testData" });
    expect(callback2).toHaveBeenCalledWith({ data: "testData" });
  });

  test("should handle emitting events with no listeners", () => {
    expect(() => emitter.emit("nonExistentEvent", {})).not.toThrow();
  });
});
