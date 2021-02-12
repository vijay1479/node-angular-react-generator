#!/usr/bin/env node
const inquirer = require("inquirer");
const fs = require("fs");
const ejs = require("ejs");
const CURR_DIR = process.cwd();

inquirer
  .prompt([
    {
      type: "input",
      name: "schema",
      message: "Define your Schema like example: name:string age:number....",
    },
    {
      name: "schema_name",
      type: "input",
      message: "Schema name:",
      validate: function (input) {
        if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
        else
          return "Project name may only include letters, numbers, underscores and hashes.";
      },
    },
  ])
  .then((answers) => {
    console.info("Answer:", JSON.stringify(answers));
    createModel(answers);
    createController(answers);
    createRoutes(answers);
  });

function createModel(answers) {
  const file_name = answers.schema_name;
  const file_upper = file_name.charAt(0).toUpperCase() + file_name.slice(1);
  const schema_raw = answers.schema;
  const fields = schema_raw.split(" ");
  let schema = {};
  fields.forEach((element) => {
    const [key, value] = element.split(":");
    schema[key] = value;
  });

  const templatePath = `${__dirname}/views/model.ejs`;
  ejs.renderFile(
    templatePath,
    { schema_name: file_name, schema: schema ,schema_upper: file_upper},
    {},
    function (err, str) {
      fs.appendFile(
        `${CURR_DIR}/models/${file_name}.model.js`,
        str,
        function (err) {
          if (err) throw err;
          console.log("Model Created!");
        }
      );
    }
  );
}

function createController(answers) {
  const file_name = answers.schema_name.toLowerCase();
  const file_upper = file_name.charAt(0).toUpperCase() + file_name.slice(1);
  const schema_raw = answers.schema;
  const fields = schema_raw.split(" ");
  let key_values = [];
  fields.forEach((element) => {
    const [key, value] = element.split(":");
    key_values.push(key);
  });
  const templatePath = `${__dirname}/views/controller.ejs`;
  ejs.renderFile(
    templatePath,
    { schema_name: file_name, schema_upper: file_upper, keys: key_values },
    {},
    function (err, str) {
      fs.appendFile(
        `${CURR_DIR}/controllers/${file_name}.controller.js`,
        str,
        function (err) {
          if (err) throw err;
          console.log("Controller Created!");
        }
      );
    }
  );
}

function createRoutes(answers) {
  const file_name = answers.schema_name;
  const templatePath = `${__dirname}/views/route.ejs`;

  ejs.renderFile(
    templatePath,
    { schema_name: file_name },
    {},
    function (err, str) {
      fs.appendFile(
        `${CURR_DIR}/routes/${file_name}.route.js`,
        str,
        function (err) {
          if (err) throw err;
          console.log("Route Created!");
        }
      );
    }
  );
}
