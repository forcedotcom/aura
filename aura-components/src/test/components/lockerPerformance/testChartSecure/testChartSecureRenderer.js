({
  afterRender: function(cmp, helper) {
    this.superAfterRender();
    var data = cmp.get("v.data");

    var chartColors = {
      red: "rgb(255, 99, 132)",
      blue: "rgb(54, 162, 235)"
    };
    var color = Chart.helpers.color;
    var chartData = {
      labels: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ],
      datasets: [
        {
          label: "Dataset 1",
          backgroundColor: color(chartColors.red)
            .alpha(0.5)
            .rgbString(),
          borderColor: chartColors.red,
          borderWidth: 1,
          data: data[0]
        },
        {
          label: "Dataset 2",
          backgroundColor: color(chartColors.blue)
            .alpha(0.5)
            .rgbString(),
          borderColor: chartColors.blue,
          borderWidth: 1,
          data: data[1]
        }
      ]
    };

    var ctx = cmp
      .find("canvas")
      .getElement()
      .getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: {
        responsive: true,
        legend: {
          position: "top"
        },
        title: {
          display: true,
          text: "Chart.js Bar Chart"
        }
      }
    });
  }
});
