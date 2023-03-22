export class PaginationVo {
  /**
   * 当前页码
   */
  page: number;
  /**
   * 页码大小（每页多少条）
   */
  size: number;

  /**
   * 总记录数
   */
  totalElements: number;

  /**
   * 总页数
   */
  totalPage: number;
}
