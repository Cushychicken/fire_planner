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
					{ title: "Regular Deposit" },
					{ title: "Annual Deposit" },
					{ title: "401(k)" },
					{ title: "Regular Deposit" },
					{ title: "Annual Deposit" },
					{ title: "Roth" },
					{ title: "Deposit" },
					{ title: "Ann. Deposit" }
				],
                columnDefs: [
                    {
                        targets: [ 3, 4, 6, 7, 9, 10], 
                        visible: false
                    },
                    { name: "age",      targets: 0  },
                    { name: "swr",      targets: 1  },
                    { name: "tax",      targets: 2  },
                    { name: "tax_dep",  targets: 3  },
                    { name: "tax_ann",  targets: 4  },
                    { name: "401k",     targets: 5  },
                    { name: "401k_dep", targets: 6  },
                    { name: "401k_ann", targets: 7  },
                    { name: "roth",     targets: 8  },
                    { name: "roth_dep", targets: 9  },
                    { name: "roth_ann", targets: 10 }
                ],
				bFilter: false, 
				bInfo: false,
				paging: false,
                ordering: false
			});
		}

}

function drawRetirementTable(dataset, table_id) {
    if ( $.fn.dataTable.isDataTable( table_id ) ) {
        table = $(table_id).DataTable();
        table.clear();
        table.rows.add(dataset);
        table.draw();
    } else {
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
            paging: false,
            ordering: false
        });
    }
}

$(document).ready(function() {
	$('#button-id').click(function() {
		var age          = $('#formAge').val();
		var pay_per      = $('#formPayPeriods').val();
		var avg_return   = $('#formAvgReturns').val();
		var swr_rate     = $('#formSafeWithdrawal').val();

		var value_tax			= Number($('#formValueTaxable').val().replace(/[^0-9\.]+/g,""));
		var value_401k			= Number($('#formValue401k').val().replace(/[^0-9\.]+/g,""));
		var value_roth			= Number($('#formValueRoth').val().replace(/[^0-9\.]+/g,""));

		var deposit_tax			= Number($('#formDepositTaxable').val().replace(/[^0-9\.]+/g,""));
		var deposit_401k		= Number($('#formDeposit401k').val().replace(/[^0-9\.]+/g,""));
		var deposit_roth		= Number($('#formDepositRoth').val().replace(/[^0-9\.]+/g,""));

		var deposit_tax_annual  = Number($('#formDepositTaxableAnnual').val().replace(/[^0-9\.]+/g,""));
		var deposit_401k_annual = Number($('#formDeposit401kAnnual').val().replace(/[^0-9\.]+/g,""));
		var deposit_roth_annual = Number($('#formDepositRothAnnual').val().replace(/[^0-9\.]+/g,""));

		var dataset = [];

        // Validating default vs user input Avg Return/SWR Rates
        if (avg_return==null || avg_return=="") {
            avg_return = 0.07;
        } 

        if (swr_rate==null || swr_rate=="") {
            swr_rate = 0.04;
        } 
       
		var i = Number(age); 

        var project_tax  = futureValue(avg_return, value_tax, deposit_tax, pay_per, (i - age));
        var project_401k = futureValue(avg_return, value_401k, deposit_401k, pay_per, (i - age));
        var project_roth = futureValue(avg_return, value_roth, deposit_roth, pay_per, (i - age));

        data = [ 
            i,
            formatMoney((swr_rate*project_tax)),
            formatMoney(project_tax),
            formatMoney(deposit_tax),
            formatMoney(deposit_tax_annual),
            formatMoney(project_401k),
            formatMoney(deposit_401k),
            formatMoney(deposit_401k_annual),
            formatMoney(project_roth),
            formatMoney(deposit_roth),
            formatMoney(deposit_roth_annual)
        ];
        dataset.push(data);

		i = i + 1;

        while ( i < 60 ) {
            var data = [];

            project_tax  = futureValue(avg_return, (project_tax + deposit_tax_annual), deposit_tax, pay_per, 1);
            project_401k = futureValue(avg_return, (project_401k + deposit_401k_annual), deposit_401k, pay_per, 1);
            project_roth = futureValue(avg_return, (project_roth + deposit_roth_annual), deposit_roth, pay_per, 1);

            data = [ 
               i,
               formatMoney((swr_rate*project_tax)),
               formatMoney(project_tax),
               formatMoney(deposit_tax),
               formatMoney(deposit_tax_annual),
               formatMoney(project_401k),
               formatMoney(deposit_401k),
               formatMoney(deposit_401k_annual),
               formatMoney(project_roth),
               formatMoney(deposit_roth),
               formatMoney(deposit_roth_annual)
            ];
            dataset.push(data);

			i = i + 1;
        }
        
        drawDataTable(dataset, "#table-tax");

        var ages = dataset.map(function(value,index) { return value[0]; });
        var taxs = dataset.map(function(value,index) { return value[2].replace(/[^0-9\.]+/g,""); });
        var swrs = dataset.map(function(value,index) { return value[1].replace(/[^0-9\.]+/g,""); });

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

        drawRetirementTable(dataset_retire, "#table-retire");

    });

    // Autopopulates retirement information form with results from savings chart 
    //      Currently broken due to the UI refactor of the projection table/collapsing tables
    $('#table-tax tbody').on('click','tr', function () {
        $(this).toggleClass('row_selected');
		var table = $("#table-tax").DataTable();
        var data  = table.row(this).data();

        $("#formAgeRetire").val(data[0]);;
        $("#formTaxableRetire").val(data[2]) ; 
        $("#form401kRetire").val(data[5]);    
        $("#formRothRetire").val(data[8]);;
    });
    
    // Hides additional investment columns, allowing you to focus on "Taxable", "401k", or "Roth"
    $('#table-tax thead').on( 'click', 'th', function (e) {
        var header_clicked = $(e.target).html();
        e.preventDefault();
        var table = $('#table-tax').DataTable();
        
        // Iterates through columns; hides those columns which weren't clicked
        //     Only works on "taxable", "401k", and "Roth" columns
        table.columns().every( function () {
            if ( $(this.header()).html() === header_clicked ) {
                switch ($(this.header()).html()) {
                    case "Taxable": 
                        var column = table.column('401k:name'); 
                        column.visible( !column.visible() );
                        column = table.column('roth:name'); 
                        column.visible( !column.visible() );
                        column = table.column('tax_dep:name'); 
                        column.visible( !column.visible() );
                        column = table.column('tax_ann:name'); 
                        column.visible( !column.visible() );
                        break;
                    case "401(k)" : 
                        var column = table.column('tax:name'); 
                        column.visible( !column.visible() );
                        column = table.column('roth:name'); 
                        column.visible( !column.visible() );
                        column = table.column('401k_dep:name'); 
                        column.visible( !column.visible() );
                        column = table.column('401k_ann:name'); 
                        column.visible( !column.visible() );
                        break;
                    case "Roth"   :
                        var column = table.column('401k:name'); 
                        column.visible( !column.visible() );
                        column = table.column('tax:name'); 
                        column.visible( !column.visible() );
                        column = table.column('roth_dep:name'); 
                        column.visible( !column.visible() );
                        column = table.column('roth_ann:name'); 
                        column.visible( !column.visible() );
                        break;
                }
            }
        });
    } );
});
			
