import { describe, it, expect } from 'vitest';
import { moveItem } from '../../ui/move-item.js';

describe('moveItem', () => {
  it('swaps adjacent items moving down', () => {
    const arr = ['a', 'b', 'c'];
    moveItem(arr, 0, 1);
    expect(arr).toEqual(['b', 'a', 'c']);
  });

  it('swaps adjacent items moving up', () => {
    const arr = ['a', 'b', 'c'];
    moveItem(arr, 2, -1);
    expect(arr).toEqual(['a', 'c', 'b']);
  });

  it('does nothing when moving first item up', () => {
    const arr = ['a', 'b', 'c'];
    moveItem(arr, 0, -1);
    expect(arr).toEqual(['a', 'b', 'c']);
  });

  it('does nothing when moving last item down', () => {
    const arr = ['a', 'b', 'c'];
    moveItem(arr, 2, 1);
    expect(arr).toEqual(['a', 'b', 'c']);
  });

  it('works with single-element array', () => {
    const arr = ['only'];
    moveItem(arr, 0, 1);
    expect(arr).toEqual(['only']);
    moveItem(arr, 0, -1);
    expect(arr).toEqual(['only']);
  });

  it('works with objects (schedule entries)', () => {
    const arr = [{ title: 'First' }, { title: 'Second' }, { title: 'Third' }];
    moveItem(arr, 1, -1);
    expect(arr[0].title).toBe('Second');
    expect(arr[1].title).toBe('First');
    expect(arr[2].title).toBe('Third');
  });
});
