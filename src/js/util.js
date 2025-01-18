/**
 *
 * @param {number} size
 * @returns {string}
 */
export function readableSize(size) {
    let i = Math.floor(Math.log(size) / Math.log(1000));
    if (size === 0) i = 0;
    return (
      +(size / Math.pow(1000, i)).toFixed(2) * 1 +
      " " +
      ["B", "KB", "MB", "GB"][i]
    );
  }
  