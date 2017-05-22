$(document).ready(function() {
	$('#button-id').click(function() {
		var age     = $('#formAge').val();
		var value   = $('#formValue').val();
		var deposit = $('#formDeposit').val();
		var pay_per = 24;

		var total_lo   = value;
		var total_av   = value;
		var total_hi   = value;
		var dataset = [];
		for (var i = age; i <= 60; ++i) {
			total_lo  = total_lo * 1.05;
			total_av  = total_av * 1.07;
			total_hi  = total_hi * 1.12;

			accum_lo  = total_lo.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g,'$1,');
			accum_av  = total_av.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g,'$1,');
			accum_hi  = total_hi.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g,'$1,');
			salary = (0.04 * total_av).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

			dataset.push([i , salary, accum_lo, accum_av, accum_hi]);

			total_lo  = total_lo + (deposit * pay_per);
			total_av  = total_av + (deposit * pay_per);
			total_hi  = total_hi + (deposit * pay_per);
		}

		if ( $.fn.dataTable.isDataTable( '#example' ) ) {
			table = $('#example').DataTable();
			table.clear();
			table.rows.add(dataset);
			table.draw();
		}
		else {
			$('#example').DataTable( { 
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
	});
});
