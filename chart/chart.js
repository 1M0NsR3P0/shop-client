const ctx = document.getElementById('myChart');
Chart.defaults.backgroundColor = '#8a2be2';
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
            {
                label: '# of Votes',
                data: [12, 50, 3, 5, 2, 3],
                borderWidth: 1,
            },
            {
                label: '* of Votes',
                data: [12, 48, 3, 5, 2, 3],
                borderWidth: 1,
            },
            {
                label: '$ of Votes',
                data: [12, 39, 3, 5, 2, 3],
                borderWidth: 1,
            }
        ]
    },
    options: {

        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            colors: {
                forceOverride: true,
                enabled: true
            }
        }
    }
});
const ctx2 = document.getElementById('myLineChart');
new Chart(ctx2, {
    type: 'line',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
            {
                label: '# of Votes',
                data: [12, 50, 31, 19, 2, 13],
                borderWidth: 1
            },
            {
                label: '# of Votes',
                data: [19, 34, 35, 3, 2, 1],
                borderWidth: 1
            },

        ]
    },
    options: {

        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            colors: {
                forceOverride: true,
                enabled: true
            }
        }
    }
});