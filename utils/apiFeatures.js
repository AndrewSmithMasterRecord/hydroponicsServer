class APIfeatures
 {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const excludeList = ['page', 'limit', 'sort', 'fields'];
    excludeList.forEach((el) => delete queryObj[el]);

    //ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);
   
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      let sortString = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortString);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitingFields() {
    if (this.queryString.fields) {
      const fieldsString = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fieldsString);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIfeatures;