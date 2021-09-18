const Helper = {

/**
   * Query Join Filter
   * @param {object} req request
   * @param {array} joinData Join Data
   * @returns {object} where object
   */
   filterJoin (req, data, search = false){
    const Op = seqlib.Op;

    var filterJoin = {};
    var filterArr = [];;

    if ((req.body.hasOwnProperty('filters') && Object.keys(req.body.filters).length) || req.body.searchText != ''){
      if (Object.keys(data).length){
        for (var val of data){
          console.log("val"+JSON.stringify(val));
          if (val.hasOwnProperty('model')){
            var model = val.model;
            var columnsLike = val.columnsLike || [];
            var columnsEqual =  val.columnsEqual || [];
            var columnsBoolean = val.columnsBoolean || [];
            var columnsBetween = val.columnsBetween || [];
            var columnsGte = val.columnsGte || [];
            var columnsLte = val.columnsLte || [];
            var columnsNotEqual = val.columnsNotEqual || [];
            var columnsIn = val.columnsIn || [];
            var columnsLikeFront = val.columnsLikeFront || [];
            var joinAlias = val.joinAlias || false;

            var filter = Helper.filter(model, req, columnsLike, columnsEqual, columnsBoolean, columnsBetween, columnsGte, columnsLte, columnsNotEqual, columnsIn, columnsLikeFront, joinAlias, search);

            filterArr.push(filter);
          }
        }
      }

      if (req.body.hasOwnProperty('filters') && Object.keys(req.body.filters).length && req.body.searchText != ''){
        console.log("satu");
        filterJoin = {
          [Op.or] : filterArr
        }
      } else if (req.body.hasOwnProperty('filters') && Object.keys(req.body.filters).length){
        console.log("dua");
        filterJoin = {
          [Op.and] : filterArr
        }
      } else {
        console.log("tiga");
        console.log(filterArr);
        filterJoin = {
          [Op.or] : filterArr
        }
      }
    }

    return filterJoin;
   },

   filter (model, req, columnsLike = [], columnsEqual = [], columnsBoolean = [], columnsBetween = [], columnsGte = [], columnsLte = [], columnsNotEqual = [], columnsIn = [], columnsLikeFront = [], joinAlias = false, search = false){
    const Op = seqlib.Op;
        
    const attribute = model.rawAttributes;
    var query = [];
    var queryFilter = [];
    var arrLike = columnsLike;
    var arrEqual = columnsEqual;
    var arrBoolean = columnsBoolean;
    var arrBetween = columnsBetween;
    var arrGte = columnsGte;
    var arrLte = columnsLte;
    var arrNotEqual = columnsNotEqual;
    var arrIn = columnsIn;
    var arrLikeFront = columnsLikeFront;
    var where = [];
    var result = {};
    var globalResult = {};
    var filterResult = {};
    var alias = joinAlias != false ? joinAlias:model.name

    for (var i in attribute){
      var searchText = req.body.searchText;

      if (arrLike.includes(i) && searchText != ""){
        query.push(
          seqlib.where(
            seqlib.fn("LOWER", seqlib.col(alias+'.'+i)),
            {
              [Op.like]: '%'+searchText.toLowerCase()+'%'
            }
          )
        );
      } else if (arrEqual.includes(i) && !isNaN(searchText) && searchText != "") {
        query.push(
          seqlib.where(
            seqlib.col(alias+'.'+i),
            {
              [Op.eq]: searchText
            }
          )
        );
      } else if (arrBoolean.includes(i) && (searchText == 0 || searchText == 1) && searchText != ""){
        searchText = (searchText == 1 ? true:false);
        query.push(
          seqlib.where(
            seqlib.col(alias+'.'+i),
            {
              [Op.is]: searchText
            }
          )
        );
      }
    }
    if (req.body.searchText != ""){
      if (search == true){
        for (var i in attribute){
          var searchTextList = req.body.searchText.split(" ");
    
          if (searchTextList.length){
            for (var text of searchTextList){
              if (text != ""){
                if (arrLike.includes(i) && text != ""){
                  query.push(
                    seqlib.where(
                      seqlib.fn("LOWER", seqlib.col(alias+'.'+i)),
                      {
                        [Op.like]: '%'+text.toLowerCase()+'%'
                      }
                    )
                  );
                } else if (arrEqual.includes(i) && !isNaN(text) && text != "") {
                  query.push(
                    seqlib.where(
                      seqlib.col(alias+'.'+i),
                      {
                        [Op.eq]: text
                      }
                    )
                  );
                } else if (arrBoolean.includes(i) && (text == 0 || text == 1) && text != ""){
                  text = (text == 1 ? true:false);
                  query.push(
                    seqlib.where(
                      seqlib.col(alias+'.'+i),
                      {
                        [Op.is]: text
                      }
                    )
                  );
                }
              }
            }
          }
        }
      }

      where.push(globalResult = {
        [Op.or] : query
      });
    }

    if (req.body.hasOwnProperty('filters') && Object.keys(req.body.filters).length){
      var filtersAttr = req.body.filters;

      for (var i in filtersAttr){
        if (filtersAttr[i].hasOwnProperty('filterVal')){
          var filterSearchText = filtersAttr[i].filterVal;

          var aliasFilter = alias;
          if (filtersAttr[i].hasOwnProperty('alias') && filtersAttr[i].alias != '' && filtersAttr[i].alias != null){
            aliasFilter = filtersAttr[i].alias;
            if (filtersAttr[i].hasOwnProperty('column') && filtersAttr[i].column != '' && filtersAttr[i].column != null){
              i = filtersAttr[i].column;
            }
          }

          if (aliasFilter == alias){
            if (arrLike.includes(i) && filterSearchText != ""){
              queryFilter.push(
                seqlib.where(
                  seqlib.fn("LOWER", seqlib.col(alias+'.'+i)),
                  {
                    [Op.like]: '%'+filterSearchText.toLowerCase()+'%'
                  }
                )
              );
            } else if (arrLikeFront.includes(i) && filterSearchText != ""){
              queryFilter.push(
                seqlib.where(
                  seqlib.fn("LOWER", seqlib.col(alias+'.'+i)),
                  {
                    [Op.like]: filterSearchText.toLowerCase()+'%'
                  }
                )
              );
            } else if (arrEqual.includes(i) && filterSearchText != "") {
              queryFilter.push(
                seqlib.where(
                  seqlib.col(alias+'.'+i),
                  {
                    [Op.eq]: filterSearchText
                  }
                )
              );
            } else if (arrBoolean.includes(i) && typeof filterSearchText == "boolean"){
              // filterSearchText = (filterSearchText == 1 ? true:false);
              queryFilter.push(
                seqlib.where(
                  seqlib.col(alias+'.'+i),
                  {
                    [Op.is]: filterSearchText
                  }
                )
              );
            } else if (arrBetween.includes(i) && filterSearchText.length == 2){
              queryFilter.push(
                seqlib.where(
                  seqlib.col(alias+'.'+i),
                  {
                    [Op.between]: filterSearchText
                  }
                )
              );
            } else if (arrGte.includes(i)){
              queryFilter.push(
                seqlib.where(
                  seqlib.col(alias+'.'+i),
                  {
                    [Op.Gte]: filterSearchText
                  }
                )
              );
            } else if (arrLte.includes(i)){
              queryFilter.push(
                seqlib.where(
                  seqlib.col(alias+'.'+i),
                  {
                    [Op.Lte]: filterSearchText
                  }
                )
              );
            } else if (arrNotEqual.includes(i)){
              queryFilter.push(
                seqlib.where(
                  seqlib.col(alias+'.'+i),
                  {
                    [Op.ne]: filterSearchText
                  }
                )
              );
            } else if (arrIn.includes(i) && filterSearchText.length){
              queryFilter.push(
                seqlib.where(
                  seqlib.col(alias+'.'+i),
                  {
                    [Op.in]: filterSearchText
                  }
                )
              );
            }
          }
        }
      }

      where.push(filterResult = {
        [Op.and] : queryFilter
      })
    }

    result = {
      [Op.and] : where
    }

    return result;
   },

   offset (page, size){
    return (page-1)*size;
   },

     /**
   * Random String Helper
   * @returns {string} random string
   */
  random() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 8; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  },
}


module.exports = Helper;
