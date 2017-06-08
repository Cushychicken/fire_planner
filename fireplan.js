function formatMoney(n) {
    return '$' + n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g,'$1,');
}

function futureValue(interest, value, deposit, pay_per, years) {
    var compound  = Math.pow(( 1.0 + (interest/pay_per) ), (years * pay_per));
    var principal = value * compound;

    var payments  = deposit * ((compound-1)/(interest/pay_per));

    return (principal + payments);
}

function drawDataTable(dataset, table_id) {
		if ( $.fn.dataTable.isDataTable( table_id ) ) {
			table = $(table_id).DataTable();
			table.clear();
			table.rows.add(dataset);
			table.draw();
		}
		else {
			$(table_id).DataTable( { 
				data: dataset,
				columns: [
					{ title: "Age" },
					{ title: "Taxable SWR" },
					{ title: "Taxable" },
					{ title: "401(k)" },
					{ title: "Roth" }
				],
				bFilter: false, 
				bInfo: false,
				paging: false
			});
		}

}

function drawInvestmentChart(ages, taxs, swrs) {
    var ctx = document.getElementById('chart-Investments').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
        labels: ages,
        datasets: [{
                // "principal" replaces "apples"
                label: 'Balance',
                yAxisID: 'principal',
                data: taxs,
                backgroundColor: "rgba(153,255,51,0.6)"
            }, {
                // "safe withdrawal" replaces "blues"
                label: 'Safe Withdrawal Amount',
                yAxisID: 'swr',
                type: "line",
                data: swrs,
                backgroundColor: "rgba(204,0,204,0.6)"
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    id: 'principal',
                    position: 'left',
                    stacked: true
                }, {
                    id: 'swr',
                    position: 'right'
                }],
                xAxes: [{
                    stacked: true
                }]
           }
        }
    });
}

function drawSafeWithdrawalChart(ages, taxs, swrs) {
    var ctx = document.getElementById('chart-swr').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
        labels: ages,
        datasets: [{
                // "principal" replaces "apples"
                label: 'principal',
                yAxisID: 'principal',
                data: taxs,
                backgroundColor: "rgba(153,255,51,0.6)"
            }, {
                // "safe withdrawal" replaces "blues"
                label: 'swr',
                yAxisID: 'swr',
                type: "line",
                data: swrs,
                backgroundColor: "rgba(204,0,204,0.6)"
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    id: 'principal',
                    position: 'left',
                    stacked: true
                }, {
                    id: 'swr',
                    position: 'right'
                }],
                xAxes: [{
                    stacked: true
                }]
           }
        }
    });
}

$(document).ready(function() {
	$('#button-id').click(function() {
		var age          = $('#formAge').val();
		var pay_per      = $('#formPayPeriods').val();
		var avg_return   = $('#formAvgReturns').val();
		var swr_rate     = $('#formSafeWithdrawal').val();

		var value_tax    = Number($('#formValueTaxable').val().replace(/[^0-9\.]+/g,""));
		var value_401k   = Number($('#formValue401k').val().replace(/[^0-9\.]+/g,""));
		var value_roth   = Number($('#formValueRoth').val().replace(/[^0-9\.]+/g,""));

		var deposit_tax  = Number($('#formDepositTaxable').val().replace(/[^0-9\.]+/g,""));
		var deposit_401k = Number($('#formDeposit401k').val().replace(/[^0-9\.]+/g,""));
		var deposit_roth = Number($('#formDepositRoth').val().replace(/[^0-9\.]+/g,""));

		var dataset = [];

        // Validating default vs user input Avg Return/SWR Rates
        if (avg_return==null || avg_return=="") {
            avg_return = 0.07;
        } 

        if (swr_rate==null || swr_rate=="") {
            swr_rate = 0.04;
        } 
        
        for (var i = age; i < 60; i++) {
            var data = [];

            var project_tax  = futureValue(avg_return, value_tax, deposit_tax, pay_per, (i - age));
            var project_401k = futureValue(avg_return, value_401k, deposit_401k, pay_per, (i - age));
            var project_roth = futureValue(avg_return, value_roth, deposit_roth, pay_per, (i - age));

            var nocont_401k  = futureValue(avg_return, project_401k, 0, pay_per, (60 - i ));
            var nocont_roth  = futureValue(avg_return, project_roth, 0, pay_per, (60 - i ));

            data = [ 
               i,
               formatMoney((swr_rate*project_tax)),
               formatMoney(project_tax),
               formatMoney(project_401k),
               formatMoney(project_roth)
            ];
            dataset.push(data);
        }
        
        drawDataTable(dataset, "#table-tax");

        var ages = dataset.map(function(value,index) { return value[0]; });
        var taxs = dataset.map(function(value,index) { return value[2].replace(/[^0-9\.]+/g,""); });
        var swrs = dataset.map(function(value,index) { return value[1].replace(/[^0-9\.]+/g,""); });
        drawInvestmentChart(ages, taxs, swrs);
        drawSafeWithdrawalChart(ages, taxs, swrs);

	});

	$('#button-retire-id').click(function() {
        var ageRetire        = Number($('#formAgeRetire').val());
        var incomeRetire     = Number($('#formIncomeRetire').val());

        var balanceTaxable   = Number($('#formTaxableRetire').val().replace(/[^0-9\.]+/g,""));
        var balance401k      = Number($('#form401kRetire').val().replace(/[^0-9\.]+/g,""));
        var balanceRoth      = Number($('#formRothRetire').val().replace(/[^0-9\.]+/g,""));

        var dataset_retire = [];
        
		var avg_return     = 0.07;

        var i;

        for (i = ageRetire; i < 86; i++) {
            var data = [];
            var income;

            if ( i > 59 ) { 
                income         = (0.04 * balanceTaxable) + (0.04 * balanceRoth) + (0.04 * balance401k);
                balanceTaxable = balanceTaxable - (0.04 * balanceTaxable);
                balance401k    = balance401k    - (0.04 * balance401k);
                balanceRoth    = balanceRoth    - (0.04 * balanceRoth);
            } else {
                income         = (0.04 * balanceTaxable);
                balanceTaxable = balanceTaxable - (0.04 * balanceTaxable);
            }

            balanceTaxable = futureValue(avg_return, balanceTaxable, 0, 1, 1);
            balance401k    = futureValue(avg_return, balance401k, 0, 1, 1);
            balanceRoth    = futureValue(avg_return, balanceRoth, 0, 1, 1);

            data = [
                i,
                formatMoney(income),
                formatMoney(balanceTaxable),
                formatMoney(balance401k),
                formatMoney(balanceRoth)
            ];

            dataset_retire.push(data);
        }

        drawDataTable(dataset_retire, "#table-retire");

    });

    // Autopopulates retirement information form with results from savings chart 
    $('#table-tax tbody').on('click','tr', function () {
        $(this).toggleClass('row_selected');
        $(this).find('td').each( function (i) {
            switch(i++) {
                case 0: $("#formAgeRetire").val($(this).html());     break;
                case 1:                                              break;
                case 2: $("#formTaxableRetire").val($(this).html()); break;
                case 3: $("#form401kRetire").val($(this).html());    break;
                case 4: $("#formRothRetire").val($(this).html());    break;
            }
        });
    });
    
});
			
