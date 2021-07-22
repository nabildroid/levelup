
import {IHELLO_WORLD,HelloWorld} from "../src/main";

const hello:IHELLO_WORLD = new HelloWorld();

test('returns false when number is even', () => {
    expect(hello.isOdd(10)).toBe(false);
});

test('returns true when number is odd', () => {
    expect(hello.isOdd(11)).toBe(true);
});