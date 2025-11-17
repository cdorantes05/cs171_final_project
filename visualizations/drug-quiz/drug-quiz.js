// Drug use percentage quiz with pie charts
(function() {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuiz);
  } else {
    initQuiz();
  }

  function initQuiz() {
    console.log("Initializing pie chart quiz...");

    // Actual percentages (2024 data)
    const actualData = {
      lifetime: 52.0,
      pastYear: 25.5,
      pastMonth: 16.7
    };

    // Get elements
    const lifetimeInput = document.getElementById('lifetime-guess');
    const pastYearInput = document.getElementById('pastyear-guess');
    const pastMonthInput = document.getElementById('pastmonth-guess');
    const revealButton = document.getElementById('reveal-answer');
    const tryAgainButton = document.getElementById('try-again');
    const pieChartsContainer = d3.select('#pie-charts');

    let revealed = false;

    // Chart configuration
    const chartConfig = [
      { id: 'lifetime', title: 'Lifetime Use', input: lifetimeInput, actual: actualData.lifetime },
      { id: 'pastyear', title: 'Past Year Use', input: pastYearInput, actual: actualData.pastYear },
      { id: 'pastmonth', title: 'Past Month Use', input: pastMonthInput, actual: actualData.pastMonth }
    ];

    // Create pie charts
    chartConfig.forEach(config => {
      createPieChart(config);
      
      // Update pie chart on input
      config.input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        updatePieChart(config.id, value, config.actual, false);
      });
    });

    // Reveal button
    revealButton.addEventListener('click', function() {
      const lifetime = parseFloat(lifetimeInput.value) || 0;
      const pastYear = parseFloat(pastYearInput.value) || 0;
      const pastMonth = parseFloat(pastMonthInput.value) || 0;

      if (lifetime === 0 && pastYear === 0 && pastMonth === 0) {
        alert('Please enter at least one guess!');
        return;
      }

      revealed = true;
      
      // Update all charts with actual data
      updatePieChart('lifetime', lifetime, actualData.lifetime, true);
      updatePieChart('pastyear', pastYear, actualData.pastYear, true);
      updatePieChart('pastmonth', pastMonth, actualData.pastMonth, true);

      // Disable inputs
      lifetimeInput.disabled = true;
      pastYearInput.disabled = true;
      pastMonthInput.disabled = true;

      // Show try again button
      revealButton.style.display = 'none';
      tryAgainButton.style.display = 'inline-block';
    });

    // Try again button
    tryAgainButton.addEventListener('click', function() {
      // Reset
      lifetimeInput.value = '';
      pastYearInput.value = '';
      pastMonthInput.value = '';
      lifetimeInput.disabled = false;
      pastYearInput.disabled = false;
      pastMonthInput.disabled = false;

      revealed = false;

      // Reset charts
      chartConfig.forEach(config => {
        updatePieChart(config.id, 0, config.actual, false);
      });

      revealButton.style.display = 'inline-block';
      tryAgainButton.style.display = 'none';
    });

    function createPieChart(config) {
      const container = pieChartsContainer.append('div')
        .attr('class', 'pie-chart-container')
        .attr('id', `pie-${config.id}`);

      container.append('div')
        .attr('class', 'pie-title')
        .text(config.title);

      const width = 250;
      const height = 250;
      const radius = Math.min(width, height) / 2 - 10;

      const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

      // Background circle
      svg.append('circle')
        .attr('r', radius)
        .attr('fill', 'rgba(255, 255, 255, 0.1)')
        .attr('stroke', 'rgba(255, 255, 255, 0.3)')
        .attr('stroke-width', 2);

      // Guess arc group
      svg.append('g').attr('class', 'guess-arc');
      
      // Actual arc group (initially hidden)
      svg.append('g').attr('class', 'actual-arc');

      // Labels group
      svg.append('g').attr('class', 'labels');
    }

    function updatePieChart(id, guessValue, actualValue, showActual) {
      const svg = d3.select(`#pie-${id} svg g`);
      const radius = 115;

      // Pie generator
      const pie = d3.pie()
        .value(d => d)
        .sort(null);

      // Arc generators
      const guessArc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

      const actualArc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius - 20);

      // Update guess arc
      const guessData = pie([guessValue, 100 - guessValue]);
      
      const guessGroup = svg.select('.guess-arc');
      const guessPath = guessGroup.selectAll('path')
        .data(guessData);

      guessPath.enter()
        .append('path')
        .merge(guessPath)
        .attr('fill', (d, i) => i === 0 ? '#FF6B6B' : 'rgba(255, 255, 255, 0.1)')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .transition()
        .duration(500)
        .attrTween('d', function(d) {
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return function(t) {
            return guessArc(interpolate(t));
          };
        });

      // Update actual arc (overlay)
      if (showActual) {
        const actualData = pie([actualValue, 100 - actualValue]);
        
        const actualGroup = svg.select('.actual-arc');
        const actualPath = actualGroup.selectAll('path')
          .data(actualData);

        actualPath.enter()
          .append('path')
          .merge(actualPath)
          .attr('fill', (d, i) => i === 0 ? 'rgba(76, 175, 80, 0.7)' : 'transparent')
          .attr('stroke', (d, i) => i === 0 ? '#4CAF50' : 'transparent')
          .attr('stroke-width', 3)
          .attr('stroke-dasharray', '5,5')
          .transition()
          .delay(300)
          .duration(700)
          .attrTween('d', function(d) {
            const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function(t) {
              return actualArc(interpolate(t));
            };
          });
      } else {
        svg.select('.actual-arc').selectAll('path').remove();
      }

      // Update labels
      const labelsGroup = svg.select('.labels');
      labelsGroup.selectAll('*').remove();

      // Guess label
      labelsGroup.append('text')
        .attr('class', 'guess-label')
        .attr('text-anchor', 'middle')
        .attr('y', showActual ? -15 : 0)
        .style('opacity', 0)
        .text(`${guessValue.toFixed(1)}%`)
        .transition()
        .duration(500)
        .style('opacity', 1);

      if (showActual) {
        // Actual label
        labelsGroup.append('text')
          .attr('class', 'actual-label')
          .attr('text-anchor', 'middle')
          .attr('y', 10)
          .style('opacity', 0)
          .text(`${actualValue.toFixed(1)}%`)
          .transition()
          .delay(300)
          .duration(500)
          .style('opacity', 1);

        // Error label
        const error = Math.abs(guessValue - actualValue);
        const errorText = guessValue > actualValue ? `+${error.toFixed(1)}%` : 
                         guessValue < actualValue ? `-${error.toFixed(1)}%` : 'Perfect!';
        
        labelsGroup.append('text')
          .attr('class', 'error-label')
          .attr('text-anchor', 'middle')
          .attr('y', 35)
          .style('opacity', 0)
          .text(errorText)
          .transition()
          .delay(600)
          .duration(500)
          .style('opacity', 1);
      }
    }

    console.log("Pie chart quiz initialized!");
  }
})();