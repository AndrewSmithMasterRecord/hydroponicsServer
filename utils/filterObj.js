const filterObj = (obj, ...alowFields) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (alowFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

module.exports = filterObj;
