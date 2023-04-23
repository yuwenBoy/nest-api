export const toTableTree = (arr, pid) => {
  return arr.reduce((res, current) => {
    if (current['parent_id'] == pid) {
      current['children'] = toTableTree(arr, current['id']);
      if (arr.filter((t) => t.parent_id == current['id']).length == 0) {
        current['children'] = undefined;
      }
      return res.concat(current);
    }
    return res;
  }, []);
};
