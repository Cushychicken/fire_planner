function formatMoney(n) {
    return '$' + n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g,'$1,');
}

function futureValue(age, value, deposit, pay_per, retire) {
	var total_lo   = value;
	var total_av   = value;
	var total_hi   = value;

    var dataset = [];
	for (var i = age; i <= 60; ++i) {
		total_lo  = total_lo * 1.05;
		total_av  = total_av * 1.07;
		total_hi  = total_hi * 1.12;

		accum_lo  = formatMoney(total_lo); 
		accum_av  = formatMoney(total_av);
		accum_hi  = formatMoney(total_av);

		salary = formatMoney((0.04 * total_av));

		dataset.push([i , salary, accum_lo, accum_av, accum_hi]);

		total_lo  = total_lo + (deposit * pay_per);
		total_av  = total_av + (deposit * pay_per);
		total_hi  = total_hi + (deposit * pay_per);
	}

    return dataset;
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
					{ title: "Avg Salary" },
					{ title: "Worst (5%)" },
					{ title: "Avg (7%)" },
					{ title: "Best (12%)" }
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

        dataset = futureValue(age, value_tax, deposit_tax, pay_per, 60);
        drawDataTable(dataset, '#table-tax');
        
        dataset = futureValue(age, value_401k, deposit_401k, pay_per, 60);
        drawDataTable(dataset, '#table-401k');

        dataset = futureValue(age, value_roth, deposit_roth, pay_per, 60);
        drawDataTable(dataset, '#table-roth');

	});
});
