import { 
  DynamoDBClient,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import {
 DynamoDBDocumentClient,
 ScanCommand,
 PutCommand,
 GetCommand,
 DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "caleb-pollock-final-project-db";
const imageTableName = "caleb-pollock-final-project-images";

export const handler = async (event, context) => {
 let body;
 let statusCode = 200;
 let param;
 let query;
 let contents;
 let response;
 const headers = {
   "Content-Type": "application/json",
 };

 try {
   switch (event.routeKey) {

    case "GET /files":

       query = {
           TableName: tableName
       };

       response = await dynamo.send(new ScanCommand(query));
       body = response.Items;
       break;

     case "GET /files/{name}":

       param = event.pathParameters.name;

       query = {
          TableName: tableName,
          Key: {
             id: param,
          }
       };

       response = await dynamo.send(new GetCommand(query));
       body = response.Item;
       break;
      
     case "PUT /files/upload/{name}":

      param = event.pathParameters.name;
      contents = JSON.parse(event.body);

      query = {
         Item: {
            id: param,
            start:         0,
            end:           0,
            Pe:            0,
            k:             0,
            Pa:            0,
            Ae:            0,
            A_star:        0,
            R:             0,
            pp:            0,
            mass_burned:   0,
            Ve:            0,
            Ve_error:      0,
            total_impulse: 0,
            To:            0,
            To_error:      0,
            points: contents
         },
         TableName: tableName
      };

      response = await dynamo.send(new PutCommand(query));
      body = response;
      break;

     case "POST /files/upload/{name}":

       param = event.pathParameters.name;
       contents = JSON.parse(event.body);

       query = {
          Item: {
             id: param,
             start:         0,
             end:           0,
             Pe:            0,
             k:             0,
             Pa:            0,
             Ae:            0,
             A_star:        0,
             R:             0,
             pp:            0,
             mass_burned:   0,
             Ve:            0,
             Ve_error:      0,
             total_impulse: 0,
             To:            0,
             To_error:      0,
             points: contents
          },
          TableName: tableName
       };

       response = await dynamo.send(new PutCommand(query));
       body = response;
       break;

     case "PUT /files/update/{name}":

       // first just delete the item then put it in

       param = event.pathParameters.name;
       contents = JSON.parse(event.body);

       query = {
          TableName: tableName,
          Key: {
             id: param
          }
       };

       response = await dynamo.send(new DeleteCommand(query));

       query = {
          TableName: tableName,
          Item: {
             id:            contents.name,
             start:         contents.start,
             end:           contents.end,
             Pe:            contents.Pe,
             k:             contents.k,
             Pa:            contents.Pa,
             Ae:            contents.Ae,
             A_star:        contents.A_star,
             R:             contents.R,
             pp:            contents.pp,
             mass_burned:   contents.mass_burned,
             Ve:            contents.Ve,
             Ve_error:      contents.Ve_error,
             total_impulse: contents.total_impulse,
             To:            contents.To,
             To_error:      contents.To_error,
             points:        contents.points
          }
       };

       response = await dynamo.send(new PutCommand(query));
       body = `Put item ${param}`;
       break;

     case "DELETE /files/{name}":
       param = event.pathParameters.name;

       query = {
          TableName: tableName,
          Key: {
             id: param
          }
       };

       response = await dynamo.send(new DeleteCommand(delete_item));
       body = `Delete item ${param}`;
       break;

     case "GET /images":
       query = {
           TableName: imageTableName
       };

       response = await dynamo.send(new ScanCommand(query));
       body = response.Items;
       break;

     case "PUT /images":

       contents = JSON.parse(event.body);

       query = {
           TableName: imageTableName,
           Item: {
             id: contents.name,
             data: contents.data
           }
       };

       response = await dynamo.send(new PutCommand(query));
       body = response;
       break;
/*
     case "GET /images/{name}":

       param = event.pathParameters.name;

       query = {
          TableName: imageTableName,
          Key: {
             id: param
          }
       };

       response = await dynamo.send(new GetCommand(query));
       body = response.Item;
       break;
       */

     case "GET /images/{prefix}":

       param = event.pathParameters.prefix;
  
       query = {
          TableName: imageTableName
       };

       response = await dynamo.send(new ScanCommand(query));

       body = [];
       for (let i = 0; i < response.Items.length; i++) {
          if (response.Items[i].id.startsWith(param)) {
             body.push(response.Items[i]);
          }
       }
       break;

     case "DELETE /images/{id}":

       param = event.pathParameters.name;

       query = {
          TableName: imageTableName,
          Key: {
             id: param
          }
       };

       response = await dynamo.send(new DeleteCommand(query));
       body = `Delete item ${param}`;
       break;

     default:
       throw new Error(`Unsupported route: "${event.routeKey}"`);
   }
 } catch (err) {
   statusCode = 400;
   body = err.message;
 } finally {
   body = JSON.stringify(body);
 }

 return {
   statusCode,
   body,
   headers,
 };
};

