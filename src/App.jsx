import { useState, useRef } from 'react'
import $ from 'jquery'

import jsonToCsvExport from 'json-to-csv-export'
import { Button, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { ReactTabulator } from 'react-tabulator'
import 'react-tabulator/css/tabulator.min.css'
import dayjs from 'dayjs'


function App() {

    const tableRef = useRef();

    const [startDate, setStartDate] = useState(dayjs("2024-08-27"))
    const [endDate, setEndDate] = useState(dayjs("2024-09-03"))
    const [tableData, setTableData] = useState([])
    const [customerData, setCustomerData] = useState([])
    const [appointmentData, setAppointmentData] = useState([])

    const getData = () => {

        console.log("Getting the data...")

        const urlEncoded = new URLSearchParams();

        urlEncoded.append("connectionId", import.meta.env.VITE_connId)
        urlEncoded.append("apiKey", import.meta.env.VITE_apiKey)
        urlEncoded.append("startDate", startDate.format('YYYY-MM-DD'));
        urlEncoded.append("endDate", endDate.format('YYYY-MM-DD'));
        console.log(urlEncoded)


        fetch('/api/ExternalCRM/Test/GetCRMData.ashx', {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: urlEncoded,
            redirect: 'follow'
        })
            .then(response => {
                return response.text()
            })
            .then(result => {

                console.log(result)

                // Process the list here
                const xmlDoc = $.parseXML(result)
                const $xml = $(xmlDoc)

                // EXTRACT CUSTOMER DATA
                const $customerData = $xml.find('CRMDataSet').find('Contacts').children('Item')
                const customers = []
                $customerData.each(function () {
                    const id = $(this).find('Header').find('ID').text()
                    const firstName = $(this).find('Name').find('FirstName').text()
                    const lastName = $(this).find('Name').find('LastName').text()
                    const streetAddress = $(this).find('Address').find('Street').text()
                    const city = $(this).find('Address').find('City').text()
                    const state = $(this).find('Address').find('Province').text()
                    const postalCode = $(this).find('Address').find('PostalCode').text()

                    const customer = {
                        id: id,
                        firstName: firstName,
                        lastName: lastName,
                        streetAddress: streetAddress,
                        city: city,
                        state: state,
                        postalCode: postalCode
                    }
                    customers.push(customer)
                })
                setCustomerData(customers)


                // EXTRACT INVOICES 
                const $invoiceData = $xml.find('CRMDataSet').find('Invoices').children('Item');
                const invoices = []
                $invoiceData.each(function () {

                    const id = $(this).children('Header').children('ID').text()
                    const customerId = $(this).find('ContactID').text()
                    const grandTotal = Number($(this).find('Summary').find("GrandTotal").text())
                    let payAmount = 0
                    $(this).find('Payments').children('Item').each(function () {
                        payAmount += Number($(this).find('Amount').text())
                    })
                    const type = $(this).children('Type').text()
                    const workOrderNumber = $(this).children('WorkOrderNumber').text()

                    // This customer
                    const thisCustomer = customers.find(c => c.id == customerId)


                    const invoice = {
                        id: id,
                        workOrderNumber: workOrderNumber,
                        customerId: customerId,
                        grandTotal: grandTotal,
                        payAmount: payAmount,
                        type: type,
                        firstName: thisCustomer ? thisCustomer.firstName : 'NOT FOUND',
                        lastName: thisCustomer ? thisCustomer.lastName : 'NOT FOUND',
                        streetAddress: thisCustomer ? thisCustomer.streetAddress : 'NOT FOUND',
                        city: thisCustomer ? thisCustomer.city : 'NOT FOUND',
                        state: thisCustomer ? thisCustomer.state : 'NOT FOUND',
                        postalCode: thisCustomer ? thisCustomer.postalCode : 'NOT FOUND',
                    }
                    invoices.push(invoice)
                })

                // Update table with invoices
                console.log(invoices)
                setTableData(invoices);



            })
            .catch(error => {
                console.log('error', error);
            });



    };

    const exportData = (data, filename) => {
        const dataToConvert = {
            data: data,
            filename: filename,
            delimeter: ','
        }
        jsonToCsvExport(dataToConvert)
    }


    return (
        <>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker sx={{ m: 1 }}
                    label="startDate"
                    onChange={(newValue) => setStartDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                    value={startDate}
                />
                <DatePicker sx={{ m: 1 }}
                    label="endDate"
                    onChange={(newValue) => setEndDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                    value={endDate}
                />
            </LocalizationProvider>
            <Button
                variant="contianed"
                onClick={getData}
            >GET</Button>
            <ReactTabulator
                data={tableData}
                columns={[
                    { title: "Work Order Number", field: "workOrderNumber" },
                    { title: "First Name", field: "firstName" },
                    { title: "Last Name", field: "lastName" },
                    { title: "Street Address", field: "streetAddress" },
                    { title: "City", field: "city" },
                    { title: "State", field: "state" },
                    { title: "Postal Code", field: "postalCode" },
                    { title: "Grand Total", field: "grandTotal" },
                    { title: "Payment Amount", field: "payAmount" },
                    { title: "Type", field: "type" },
                    { title: "Note", field: "note" },
                ]}
                options={{
                    pagination: true,
                    paginationSize: 30,
                    paginationSizeSelector: [10, 50, 100, 200],
                }}
            />
            <Button
                onClick={() => exportData(tableData, 'invoices.csv')}
            >Export Invoices</Button>
            <Button
                onClick={() => exportData(customerData, 'customers.csv')}
            >Export Customers</Button>
            <Button
                onClick={() => exportData(appointmentData, 'appointments.csv')}
            >Export Appointments</Button>
        </>
    )
}

export default App
