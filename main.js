$(document).ready(function() {
    var api = "https://ftyyhkn7fc.execute-api.eu-west-1.amazonaws.com/prod/gameresource";
    var currentPage = 1, perPage = 10;
    
    // Upload JSON data
    function sendData() {
      var input = $("#json_data").val();
      var dataObj;
      try {
        var data = JSON.parse(input);
        if (Array.isArray(data)) {
          dataObj = { operation: "upload_batch", items: data };
        } else {
          dataObj = { operation: "upload_single", item: data };
        }
      } catch (e) {
        alert("Invalid JSON");
        return;
      }
      $.ajax({
        url: api,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(dataObj),
        success: function(response) {
          // Simply check if statusCode is not 200
          if (response.statusCode != 200) {
            alert("Upload error: " + response.body);
          } else {
            alert("Data uploaded");
          }
        },
        error: function() {
          alert("Upload failed");
        }
      });
    }
    
    // Fill the dropdown with unique values for the selected field
    function fillDropdown() {
      var field = $("#searchFilter").val();
      $("#search_value_dropdown").empty();
      $.ajax({
        url: api,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ operation: "fetch_unique_values", field: field }),
        success: function(response) {
          if (response.statusCode != 200) {
            alert("Error: " + response.body);
            return;
          }
          // Try parsing the response. If it fails, alert the user
          var values;
          try {
            values = JSON.parse(response.body);
          } catch (e) {
            alert("Failed to parse unique values");
            return;
          }
          for (var i = 0; i < values.length; i++) {
            $("#search_value_dropdown").append("<option value='" + values[i] + "'>" + values[i] + "</option>");
          }
        },
        error: function() {
          alert("Failed to fetch unique values");
        }
      });
    }
    
    // Load results from the API based on filter
    function loadResults() {
      var field = $("#searchFilter").val();
      var value = $("#search_value_dropdown").val();
      if (field === "Year") {
        value = parseInt(value, 10);
      }
      $("#searchResults").html("Loading...");
      $.ajax({
        url: api,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ operation: "query", filter: { type: field, value: value } }),
        success: function(response) {
          if (response.statusCode != 200) {
            $("#searchResults").html("Error: " + response.body);
            return;
          }
          var games;
          try {
            games = JSON.parse(response.body);
          } catch (e) {
            $("#searchResults").html("Failed to parse query results");
            return;
          }
          showResults(games);
        },
        error: function() {
          $("#searchResults").html("Failed to load results");
        }
      });
    }
    
    // Display results in a table
    function showResults(games) {
      $("#searchResults").empty();
      $("#pagination").empty();
    
      var table = $("<table></table>");
      var header = $("<tr></tr>");
      var cols = ["Game", "Year", "Genre", "Dev", "Publisher", "Platform"];
    
      for (var i = 0; i < cols.length; i++) { // Create table header
        header.append("<th>" + cols[i] + "</th>");
      }
      table.append(header);
    
      
      var start = (currentPage - 1) * perPage;
      var count = 0;

      // Create rows - 10 per page
      for (var i = start; i < games.length && count < perPage; i++) {
        var row = $("<tr></tr>");
        for (var j = 0; j < cols.length; j++) {
          row.append("<td>" + games[i][cols[j]] + "</td>");
        }
        table.append(row);
        count++;
      }
      $("#searchResults").append(table);
    
    // Create page buttons
    $("#pages").empty(); // Clear existing buttons
      var totalPages = Math.ceil(games.length / perPage);
      for (var p = 1; p <= totalPages; p++) {
        var btn = $("<button>" + p + "</button>");
        btn.addClass("page-btn");
        if (p === currentPage) {
          btn.addClass("active");
        }
        btn.click((function(pageNum) {
          return function() {
            currentPage = pageNum;
            showResults(games);
          };
        })(p));
        $("#pages").append(btn);
      }
    }
    
    $("#upload_btn").click(sendData);
    $("#searchFilter").change(fillDropdown);
    $("#search_btn").click(function(e) {
      e.preventDefault();
      loadResults();
    });
    fillDropdown();
  });
  