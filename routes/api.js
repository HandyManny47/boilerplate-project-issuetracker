'use strict';
const { ObjectId } = require("mongoose").Types;

module.exports = function (app) {
  const data = [{
    "_id": new Object("5d76aafa28deef55e9933aaa"),
    "project": "issueT",
    "issue_title": "create login system.",
    "issue_text": "login requires username and password.",
    "created_on": "2023-05-08T06:35:14.240Z",
    "updated_on": "2023-05-08T06:35:14.240Z",
    "created_by": "Joe",
    "assigned_to": "Joe",
    "open": true,
    "status_text": "In QA"
  }];
  
  function shallowEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
  
    if (keys1.length !== keys2.length) {
      return false;
    }
  
    for (let key of keys1) {
      if (object1[key] !== object2[key]) {
        return false;
      }
    }
  
    return true;
  }
  
  function filteringCustom(item, possibleFilters, project) {
    const open = possibleFilters.open;
    const _id = possibleFilters._id;
    const assigned_to = possibleFilters.assigned_to
    const issue_title = possibleFilters.issue_title;
    const issue_text = possibleFilters.issue_text;
    const created_on = possibleFilters.created_on;
    const updated_on = possibleFilters.updated_on;
    const created_by = possibleFilters.created_by;
    const status_text = possibleFilters.status_text;

    let filteringCriteria = item.project == project;
    if (open) {
      filteringCriteria = filteringCriteria && item.open == open;
    }
    if (_id) {
      filteringCriteria = filteringCriteria && item._id == _id;
    }
    if (assigned_to) {
      filteringCriteria = filteringCriteria && item.assigned_to == assigned_to;
    }
    if (issue_title) {
      filteringCriteria = filteringCriteria && item.issue_title == issue_title;
    }
    if (issue_text) {
      filteringCriteria = filteringCriteria && item.issue_text == issue_text;
    }
    if (created_on) {
      filteringCriteria = filteringCriteria && item.created_on == created_on;
    }
    if (updated_on) {
      filteringCriteria = filteringCriteria && item.updated_on == updated_on;
    }
    if (created_by) {
      filteringCriteria = filteringCriteria && item.created_by == created_by;
    }
    if (status_text) {
      filteringCriteria = filteringCriteria && item.status_text == status_text;
    }
    return filteringCriteria
  }

  app.route('/api/issues/:project').get(function (req, res){
      const project = req.params.project;
      const _id = req.body._id;
      if (_id != undefined) {
        res.send(
          data.filter((item) => filteringCustom(item, req.query, project))
        );
      } else {
        res.send(
          data.filter((item) => filteringCustom(item, req.query, project))
        );
      }
  })
    
  app.route('/api/issues/:project').post(function (req, res) {
    const project = req.params.project;
    const open = req.query.open;

    const issue_title = req.body.issue_title;
    const issue_text = req.body.issue_text;
    const created_by = req.body.created_by;

    const assigned_to = req.body.assigned_to;
    const status_text = req.body.status_text;

    if (!issue_title || !issue_text || !created_by) {
      res.send({ error: 'required field(s) missing' })
    }

    const newId = new ObjectId()
    const newIssue = {
      "_id": newId,
      "project": project,
      "open": !open ? true : open,
      "issue_title": !issue_title ? "" : issue_title,
      "issue_text": !issue_text ? "" : issue_text,
      "created_by": created_by,
      "assigned_to": !assigned_to ? "" : assigned_to,
      "status_text": !status_text ? "" : status_text,
      "created_on": new Date(),
      "updated_on": new Date(),
      "index": data.length
    }
    data.push(newIssue);
    res.status(201)
    res.send(newIssue);
  });
    
  app.route('/api/issues/:project').put(function (req, res){
    let _id = req.body._id;
    let project = req.params.project;
    const issue_title = req.body.issue_title;
    const issue_text = req.body.issue_text;
    const created_by = req.body.created_by;
    const assigned_to = req.body.assigned_to;
    const status_text = req.body.status_text;
    const closing = req.body.open;

    try {
      if (_id == undefined) {
        res.send({ error: 'missing _id' })
        return
      }

      if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !closing) {
        res.send({ error: 'no update field(s) sent', '_id': _id });
        return
      }

      const itemIndex = data.findIndex(obj => obj._id == _id && obj.project == project);
      if (itemIndex == -1) {
        res.send({ error: 'could not update', '_id': _id });
        return
      }
      const item = data[itemIndex]
      console.log(itemIndex)
      console.log(data[item["index"]])

      const originalItem = {...item};

      if(issue_title && issue_title != item["issue_title"]) {
        item["issue_title"] = issue_title;
      }

      if(issue_text && issue_text != item["issue_text"]) {
        item["issue_text"] = issue_text;
      }

      if(created_by && created_by != item["created_by"]) {
        item["created_by"] = created_by;
      }

      if(assigned_to && assigned_to != item["assigned_to"]) {
        item["assigned_to"] = assigned_to;
      }

      if(status_text && status_text != item["status_text"]) {
        item["status_text"] = status_text;
      }

      if(closing && closing != item["closing"]) {
        item["open"] = false;
      }

      if (shallowEqual(item, originalItem)) {
        throw new Error("We didnt update shit wtf.");
        return
      }

      item["updated_on"] = new Date();
      item["updated_on"].setSeconds(item["updated_on"].getSeconds() + 3);
      data[item["index"]] = item;
      console.log(data[item["index"]])
      res.send({ result: 'successfully updated', '_id': _id });
    } catch (e) {
      // TODO: NEXT STEP IS TO PRINT THE ERRORS FROM CATCH AND FIGURE OUT WHY ITS NOT WORKING.
      console.log(e)
      res.send({ error: 'could not update', '_id': _id })
    }
  })
    
  app.route('/api/issues/:project').delete(function (req, res){
    let project = req.params.project;
    let _id = req.body._id;
    try {
      if (!_id || _id == undefined) {
        res.send({ error: 'missing _id'});
        return
      }
      // Suppose we want to remove the item with index 2 ('cherry')
      let indexToRemove = data.findIndex(obj => obj._id == _id && obj.project == project);
      if (indexToRemove == -1) {
        res.send({ error: 'could not delete', '_id': _id });
        return
      }

      data.splice(indexToRemove, 1);

      // Update indices for all items following the removed one
      for (let i = indexToRemove; i < data.length; i++) {
        if (data == undefined || data[i] == undefined) {
          continue;
        }
        if (data && "index" in data[i]) {
          data[i]["index"] = i;
        }
      }
      res.send({ result: 'successfully deleted', '_id': _id });
    } catch (e) {
      // TODO: NEXT STEP IS TO PRINT THE ERRORS FROM CATCH AND FIGURE OUT WHY ITS NOT WORKING.
      console.log(e)
      res.send({ error: 'could not delete', '_id': _id })
    }
  });
    
};
