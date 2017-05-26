function formatMoney(n) {
    return '$' + n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g,'$1,');
}

function futureValue(age, interest, value, deposit, pay_per, years) {
    var compound  = Math.pow(( 1.0 + (interest/pay_per) ), (years * pay_per));
    var principal = value * compound;

    var payments  = deposit * ((compound-1)/(interest/pay_per));
    console.log(payments);

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
					{ title: "Income" },
					{ title: "Taxable" },
					{ title: "401(k)" },
					{ title: "Roth" }
					//{ title: "Income @ Age 60" }
				],
				bFilter: false, 
				bInfo: false,
				paging: false
			});
		}

}

$(document).ready(function() {
	$('#button-id').click(function() {
		var age          = $('#formAge').val();
		var pay_per      = $('#formPayPeriods').val();

		var value_tax    = $('#formValueTaxable').val();
		var value_401k   = $('#formValue401k').val();
		var value_roth   = $('#formValueRoth').val();

		var deposit_tax  = $('#formDepositTaxable').val();
		var deposit_401k = $('#formDeposit401k').val();
		var deposit_roth = $('#formDepositRoth').val();

		var dataset = [];

        for (var i = age; i < 60; i++) {
            var data = [];

            var project_tax  = futureValue(i, 0.07, value_tax, deposit_tax, 24, (i - age));
            var project_401k = futureValue(i, 0.07, value_401k, deposit_401k, 24, (i - age));
            var project_roth = futureValue(i, 0.07, value_roth, deposit_roth, 24, (i - age));

            var nocont_401k  = futureValue(i, 0.07, project_401k, 0, 24, (60 - i ));
            var nocont_roth  = futureValue(i, 0.07, project_roth, 0, 24, (60 - i ));

            data = [ 
               i,
               formatMoney((0.04*project_tax)),
               formatMoney(project_tax),
               formatMoney(project_401k),
               formatMoney(project_roth)
               //formatMoney((nocont_401k + nocont_roth) * 0.04)
            ];
            dataset.push(data);
        }
        
        drawDataTable(dataset, "#table-tax");
	});
});
			

