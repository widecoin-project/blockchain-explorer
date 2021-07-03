// Config
var networksConfigs = {
    'WCN': {
        'name': 'Main Network (WCN)',
        'api': 'http://api.widecoin.org',
        'ticker': 'WCN',
        'decimals': 8,
        'hrp': 'wc'
    },
    'TWCN': {
        'name': 'Test Network (TWCN)',
        'api': 'https://api-testnet.sugarchain.org',
        'ticker': 'TUGAR',
        'decimals': 8,
        'hrp': 'tw'
    }
}

// Error messages
var errorMessages = {
    'blocks-load-error': 'There was an error while trying to load the blocks!',
    'blocks-not-found': 'Block not found!',
    'tx-not-found': 'Transaction not found!',
    'nan-error': 'The height of the block should be a non-negative integer!',
    'no-block-specified': 'You must specify blocks!',
    'no-tx-specified': 'You must specify transaction!',
    'not-valid-address': 'You must specify valid address!',
    'search-error': 'We can\'t process your request :(',
    'circulating-supply-load-error': 'There was an error while trying to load the circulating supply :('
}

function showCharts(data) {
    var step = 2

    if ($(document).width() < 576) {
        step = 9
    } else if ($(document).width() < 1200) {
        step = 4
    }

    $('#charts').removeClass('d-none')
    Highcharts.chart('network-chart', {
        'chart': {
            'type': 'spline',
            'height': 240,
            'marginLeft': 40, // Keep all charts left aligned
            'spacingTop': 20,
            'spacingBottom': 20
        },
        'title': {
            'text': ''
        },
        'xAxis': [{
            'categories': [].concat(data["blocks"]).reverse(),
            'crosshair': true,
            'labels': {
                'enabled': true,
                'step': step
            }
        }],
        'yAxis': [{
            'labels': {
                'enabled': false
            },
            'title': {
                'text': null
            }
        }, {
            'labels': {
                'enabled': false
            },
            'title': {
                'text': null
            }
        }, {
            'labels': {
                'enabled': false
            },
            'title': {
                'text': null
            },
            'opposite': true
        }, {
            'labels': {
                'enabled': false
            },
            'title': {
                'text': null
            }
        }, {
            'labels': {
                'enabled': false
            },
            'title': {
                'text': null
            }
        }],
        'tooltip': {
            'shared': true,
            formatter: function() {
                var s = '<b>' + this.x + '</b>';

                $.each(this.points, function(i, point) {
                    text = point.y
                    if (i == 3) {
                        text = convertHashes(point.y)
                    }

                    s += '<br/><span style="color:' + point.color + '">\u25CF</span>: ' + point.series.name + ': ' + text;
                });

                return s;
            },
        },
        'plotOptions': {
            'series': {
                'animation': false,
                'label': {
                    'connectorAllowed': true
                },
                'marker': {
                    'enabled': false,
                    'size': 2
                }
            }
        },
        'series': [{
            'name': 'Difficulty',
            'data': [].concat(data["diffs"]).reverse(),
            'yAxis': 1,
            'color': '#7cb5ec',
            'type': 'areaspline',
            'fillOpacity': 0.3
        }, {
            'name': 'Transactions',
            'data': [].concat(data["txs"]).reverse(),
            'yAxis': 2,
            'color': '#90ed7d'
        }, {
            'name': 'Size',
            'data': [].concat(data["sizes"]).reverse(),
            'yAxis': 3,
            'color': '#f7a35c'
        }, {
            'name': 'Network hashrate',
            'data': [].concat(data["nethash"]).reverse(),
            'yAxis': 4,
            'color': '#ff2a65'
        }],
        'responsive': {
            'rules': [{
                'condition': {
                    'maxWidth': 500,
                },
                'chartOptions': {
                    'legend': {
                        'layout': 'horizontal',
                        'align': 'center',
                        'verticalAlign': 'bottom'
                    }
                }
            }]
        }
    });
    $('.highcharts-credits').hide();
}

// Convert amount of hashes to readable form
function convertHashes(hashes) {
    if (hashes >= 1000000000000000000000) {
        return (hashes / 1000000000000000000000).toFixed(2) + ' Zh/s'
    } else if (hashes >= 1000000000000000000) {
        return (hashes / 1000000000000000000).toFixed(2) + ' Eh/s'
    } else if (hashes >= 1000000000000000) {
        return (hashes / 1000000000000000).toFixed(2) + ' Ph/s'
    } else if (hashes >= 1000000000000) {
        return (hashes / 1000000000000).toFixed(2) + ' Th/s'
    } else if (hashes >= 1000000000) {
        return (hashes / 1000000000).toFixed(2) + ' Gh/s'
    } else if (hashes >= 1000000) {
        return (hashes / 1000000).toFixed(2) + ' Mh/s'
    } else if (hashes >= 1000) {
        return (hashes / 1000).toFixed(2) + ' Kh/s'
    } else {
        return hashes + ' H/s'
    }
}

// Display doc links
function displayDocs() {
    $('a.api-link').each(function() {
        docsLink = getApi()['api'] + docs[$(this).attr('data-docs-link')];
        $(this).attr('href', docsLink)
        $(this).text(docsLink)
    });
}

// Get current network config
function getApi() {
    var network = readCookie('network')
    if (network == null || networksConfigs[network] == undefined) {
        setCookie('network', Object.keys(networksConfigs)[0], 60)
        network = readCookie('network')
    }

    return networksConfigs[network]
}

// Switch network
function switchApi(network, page = '') {
    network = network.toUpperCase()
    if (networksConfigs[network] != undefined & networksConfigs[network] != getApi()) {
        setCookie("network", network, 60)
        $('#blocks-table tbody').empty()
        $('#block-info-hash').empty()
        $('#data-address').empty()
        $('#tx-info-hash').empty()
        $('#charts').addClass('d-none')
        displayNetworks()
        displayHome()
    }
    switchPage(page)
}

// Display networks list
function displayNetworks() {
    network = getApi()
    $('#network-versions').text(network['name'])
    $('#network-list .dropdown-menu').empty()

    for (var key in networksConfigs) {
        $('#network-list .dropdown-menu').append(`<a class="dropdown-item ${networksConfigs[key]['name'] == network['name'] ? 'active' : ''}" href="#/network/${key}">${networksConfigs[key]['name']}</a>`)
    }
}

// SPA router function
function routePage() {
    var urlParams = readParams()
    if (window.location.hash == '') {
        window.location.replace(window.location.href.split('#')[0] + '#/')
    }

    if (urlParams[0] == '#') {
        var pageName = urlParams[1] != '' ? urlParams[1] : 'homepage'
        var templateName = '#' + pageName
        
        if ($('.router-page:visible').attr('id') != urlParams[1]) {
            $('div.router-page').hide()
            if ($(templateName).length) {
                $(templateName).show()
            }
        }

        switch(pageName) {
            // Block info page
            case 'block':
                var block_hash = urlParams[2]
                var api = urlParams[3]
                var data_block_hash = $('#block-info-hash').attr('data-block-info-hash')
                if (block_hash != undefined && block_hash.length == 64) {
                    if (api != undefined) {
                        page = urlParams[1] + '/' + urlParams[2]
                        switchApi(api, page)
                    } else {
                        if (data_block_hash != urlParams[2]) {
                            $('#block-info-tx-total').addClass('d-none')
                            $('#block-info-table').empty()
                            blockInfo(block_hash).then(function(block) {
                                if (block['error'] == undefined) {
                                    setTitle('Block #' + block.result.height)
                                    displayBlockInfo(block.result)
                                } else {
                                    showError(errorMessages['blocks-not-found'])
                                    switchPage()
                                }
                            })
                        } else {
                            setTitle('Block #' + block_hash)
                        }
                    }

                } else {
                    showError(errorMessages['no-block-specified'])
                    switchPage()
                }

                break

            // Transaction info page
            case 'transaction':
                var tx_hash = urlParams[2]
                var api = urlParams[3]
                var data_tx_hash = $('#tx-info-hash').attr('data-tx-info-hash')
                if (tx_hash != undefined) {
                    if (api != undefined) {
                        page = urlParams[1] + '/' + urlParams[2]
                        switchApi(api, page)
                    } else {
                        if (data_tx_hash != urlParams[2]) {
                            $('#tx-info-vout-total').addClass('d-none')
                            $('#tx-info-vin-total').addClass('d-none')
                            $('#tx-info-table').empty()
                            transactionInfo(tx_hash).then(function(tx) {
                                if (tx['error'] == undefined) {
                                    setTitle('Transaction ' + tx_hash)
                                    displayTransactionInfo(tx.result)
                                } else {
                                    showError(errorMessages['tx-not-found'])
                                    switchPage()
                                }
                            })
                        } else {
                            setTitle('Transaction ' + data_tx_hash)
                        }
                    }
                } else {
                    showError(errorMessages['no-tx-specified'])
                    switchPage()
                }

                break

            case 'address':
                var address = urlParams[2]
                var api = urlParams[3]
                var data_address = $('#data-address').attr('data-address')
                if (address != undefined) {
                    if (api != undefined) {
                        page = urlParams[1] + '/' + urlParams[2]
                        switchApi(api, page)
                    } else {
                        if (data_address != urlParams[2]) {
                            $('#address-history').addClass('d-none')
                            $('#address-info-table').empty()
                            addressBalance(address).then(function(data) {
                                if (data['error'] == undefined) {
                                    setTitle('Address ' + address)
                                    displayAddressInfo(data.result, address)
                                } else {
                                    showError(errorMessages['not-valid-address'])
                                    switchPage()
                                }
                            })
                        } else {
                            setTitle('Address ' + data_address)
                        }
                    }
                } else {
                    showError(errorMessages['not-valid-address'])
                    switchPage()
                }

                break

            // Redirect to block page by block height
            case 'height':
                block_height = urlParams[2]
                if (block_height != undefined && isNumeric(block_height)) {
                    blockHeight(urlParams[2]).then(function(block) {
                        setTitle('Loading')
                        if (block['error'] == undefined) {
                            switchPage('block', [block['result']['hash']])
                        } else {
                            showError(errorMessages['blocks-load-error'])
                            switchPage()
                        }
                    })
                } else {
                    showError(errorMessages['nan-error'])
                    switchPage()
                }

                break

            // Home page ¯\_(ツ)_/¯
            case 'homepage':
                setTitle('Latest Blocks')
                displayHome()

                break

            // Swith network to explore
            case 'network':
                network = urlParams[2]
                if (network != undefined) {
                    switchApi(network)
                }

                break

            default:
                switchPage()

                break
        }
    }
}

// Switch router page
function switchPage(url = '', params = []) {
    params = params.length > 0 ? '/' + params.join('/') : ''
    window.location.hash = '#' + '/' + url + params;
}

// Read URL params
function readParams() {
    return window.location.hash.split('/')
}

// Set window title
function setTitle(title) {
    document.title = title + ' | Widecoin Explorer';
}

// Bocks request
function getBlocks(start, offset = 30) {
    return Promise.resolve($.ajax({
        'url': getApi()['api'] + '/range/' + start + '?offset=' + offset,
    })).then(function(data) {
        return data
    })
}

// Block info
function blockInfo(hash, offset = 0) {
    return Promise.resolve($.ajax({
        'url': getApi()['api'] + '/block/' + hash + '?offset=' + offset,
    })).then(function(data) {
        return data
    })
}

// Get transaction info
function transactionInfo(hash) {
    return Promise.resolve($.ajax({
        'url': getApi()['api'] + '/transaction/' + hash,
    })).then(function(data) {
        return data
    })
}

// Get address balance
function addressBalance(address) {
    return Promise.resolve($.ajax({
        'url': getApi()['api'] + '/balance/' + address,
    })).then(function(data) {
        return data
    })
}

// Get address history
function addressHistory(address, offset = 0) {
    return Promise.resolve($.ajax({
        'url': getApi()['api'] + '/history/' + address + '?offset=' + offset,
    })).then(function(data) {
        return data
    })
}

// Get current network info
function networkInfo() {
    return Promise.resolve($.ajax({
        'url': getApi()['api'] + '/info',
    })).then(function(data) {
        return data
    })
}

// Get circulating supply
function networkSupply() {
    return Promise.resolve($.ajax({
        'url': getApi()['api'] + '/supply',
    })).then(function(data) {
        return data
    })
}

// Get block by height
function blockHeight(height) {
    return Promise.resolve($.ajax({
        'url': getApi()['api'] + '/height/' + height,
    })).then(function(data) {
        return data
    })
}

// Display stuffs here~
function displayBlocks(blocks, prepend = false) {
    blocks = prepend ? blocks.reverse() : blocks
    blocks.forEach(function(block, index) {
        if ($('tr[data-height="' + block.height + '"]').length == 0) {
            var content = `
                <tr data-height="${block.height}">
                    <td>
                        <a href="#/block/${block.hash}">
                            ${block.height}
                        </a>
                    </td>
                    <td>
                        ${timeFormat(block.time)}
                    </td>
                    <td>
                        <a href="#/block/${block.hash}">
                            ${block.hash}
                        </a>
                    </td>
                    <td>
                        ${block.txcount != undefined ? block.txcount : '1'}
                    </td>
                </tr>`

            if (prepend) {
                $('#blocks-table tbody').prepend(content)
            } else {
                $('#blocks-table tbody').append(content)
            }
        }	

        if (block.height == 0) {
            $('#more').addClass('d-none')
        }
    });
}

function displayBlockInfo(data) {
    $('#block-transactions').empty()
    content = `
        <div class="card mb-3">
            <div class="table-responsive">
                <table class="table table-borderless table-md table-striped mb-0">
                    <tbody>
                        <tr>
                            <td>Height</td>
                            <td id="block-info-height" data-block-info-height="${data.height}">${data.height} (<b>Confirmations ${data.confirmations}</b>)</td>
                        </tr>
                        <tr>
                            <td>Timestamp</td>
                            <td>${timeFormat(data.time)} (<b>${data.time}</b>)</td>
                        </tr>
                        <tr>
                            <td>Block Hash</td>
                            <td id="block-info-hash" data-block-info-hash="${data.hash}">${data.hash}</td>
                        </tr>
                        <tr>
                            <td>Previous Block</td>
                            <td>
                                <a class="${'previousblockhash' in data ? '' : 'd-none'}" href="#/block/${data.previousblockhash}">${data.previousblockhash}</a>
                                <span class=${'previousblockhash' in data ? 'd-none' : ''}>
                                    <b>Genesis Block</b>
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td>Next Block</td>
                            <td>
                                ${data.nextblockhash != undefined ? `
                                    <a href="#/block/${data.nextblockhash}">
                                        ${data.nextblockhash}
                                    </a>
                                ` : `
                                    <b>This is latest block</b>
                                `}
                            </td>
                        </tr>
                        <tr>
                            <td>Merkle Root</td>
                            <td>
                                ${data.merkleroot}
                            </td>
                        </tr>
                        <tr>
                            <td>Nonce</td>
                            <td>${data.nonce}</td>
                        </tr>
                        <tr>
                            <td>Version</td>
                            <td>${data.versionHex}</td>
                        </tr>
                        <tr>
                            <td>Bits</td>
                            <td>${data.bits}</td>
                        </tr>
                        <tr>
                            <td>Size</td>
                            <td>${data.size} Bytes</td>
                        </tr>
                        <tr>
                            <td>Stripped Size</td>
                            <td>${data.strippedsize} Bytes</td>
                        </tr>
                        <tr>
                            <td>Difficulty</td>
                            <td>${data.difficulty}</td>
                        </tr>
                        <tr>
                            <td>Transactions</td>
                            <td>${data.txcount}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>`

    $('#block-info-table').html(content)

    displayTransactions($('#block-transactions'), data.tx)

    if (data.txcount > $('#block-transactions').children().length) {
        $('#more-block-transactions').removeClass('d-none')
    } else {
        $('#more-block-transactions').addClass('d-none')
    }

    $('#block-info-tx-total').removeClass('d-none')
}

function displayTransactionInfo(data) {
    content = `
        <div class="card mb-3">
            <div class="table-responsive">
                <table class="table table-borderless table-md table-striped mb-0">
                    <tbody>
                        <tr>
                            <td>Transaction Hash</td>
                            <td id="tx-info-hash" data-tx-info-hash="${data.txid}">${data.txid}</td>
                        </tr>
                        ${data.time != undefined ? `
                            <tr>
                                <td>Timestamp</td>
                                <td>${timeFormat(data.time)} (<b>${data.time}</b>)</td>
                            </tr>
                        ` : ''}
                        <tr>
                            <td>Height</td>
                            <td>
                                ${data.blockhash != undefined ? `
                                    <a href="#/block/${data.blockhash}">${data.height}</a> (<b>Confirmations ${data.confirmations}</b>)
                                ` : `
                                    <span class="text-danger">This transaction located in memory pool and not included to blockchain yet!</span>
                                `}
                            </td>
                        </tr>
                        <tr>
                            <td>Amount Transferred</td>
                            <td><span class="text-monospace">${amountFormat(data.amount)}</span> <b>${getApi()['ticker']}</b></td>
                        </tr>
                        <tr>
                            <td>Size</td>
                            <td>${data.size} (bytes)</td>
                        </tr>
                        <tr>
                            <td>Version</td>
                            <td>${data.version}</td>
                        </tr>
                        <tr class="${data.locktime == 0 ? 'd-none' : ''}">
                            <td>Locktime</td>
                            <td>${data.locktime}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>`

    $('#tx-info-table').html(content)
    $('#tx-info-vout-total .card-header b').text(data.vout.length)
    $('#tx-info-vin-total .card-header b').text(data.vin.length)
    $('#tx-vout-list').empty()
    $('#tx-vin-list').empty()

    var vin_amount = 0
    data.vin.forEach(function(vin) {
        vin_amount += vin.value
    })

    var vout_amount = 0
    data.vout.forEach(function(vout) {
        vout_amount += vout.value
    })

    var fee = vin_amount - vout_amount

    displayTxVout(data.vout, fee)
    displayTxVin(data.vin)

    $('#tx-info-vout-total').removeClass('d-none')
    $('#tx-info-vin-total').removeClass('d-none')
}

function showQrModal(e, text) {
    $('#qrCode').empty()
    $('#qrCode').qrcode(text)
    $('#qrModal .title').text(text)
    $('#qrModal').modal('toggle')
    e.preventDefault()
}

function displayAddressInfo(data, address) {
    $('#address-transactions').empty()
    content = `
        <div class="card mb-3">
            <div class="table-responsive">
                <table class="table table-borderless table-md table-striped mb-0">
                    <tbody>
                        <tr>
                            <td>Address</td>
                            <td id="data-address" data-address="${address}">
                                ${address}
                                <a href="#" onclick="showQrModal(event, '${address}')">(QR)</a>
                            </td>
                        </tr>
                        <tr>
                            <td>Hash160</td>
                            <td>${hash160(address)}</td>
                        </tr>
                        <tr>
                            <td>Received</td>
                            <td><span class="text-monospace">${amountFormat(data.received)}</span> <b>${getApi()['ticker']}</b></td>
                        </tr>
                        <tr>
                            <td>Balance</td>
                            <td><span class="text-monospace">${amountFormat(data.balance)}</span> <b>${getApi()['ticker']}</b></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>`

    $('#address-info-table').html(content)

    addressHistory(address).then(function(data) {
        if (data.error == undefined) {
            if (data.result.txcount > 10 && data.result.tx.length >= 10) {
                $('#more-address-transactions').removeClass('d-none')
            } else {
                $('#more-address-transactions').addClass('d-none')
            }

            $('#address-info .address-tx-count').text(data.result.txcount)
            displayTransactions($('#address-transactions'), data.result.tx)
        }
    })
}

function parseTransactionDetails(data) {
    var status = {
        'coinbase': false,
        'input': 0,
        'output': 0,
        'fee': 0,
        'from': '',
        'to': '',
        'badge': {
            'text': '',
            'class': ''
        }
    }

    inputs = {}
    outputs = {}

    data.vin.forEach(function(vin, index) {
        if (vin.coinbase != undefined) {
            status.coinbase = true
            status.from += `
                <li class="list-group-item">
                    Newly Generated Coins (<b>Coinbase Transaction</b>)
                </li>`
        } else if (vin.value != undefined) {
            var address = vin.scriptPubKey.addresses[0]

            if (address in inputs) {
                inputs[address] += vin.value
            } else {
                inputs[address] = vin.value
            }

            status.input += vin.value
        }
    })

    for (address in inputs) {
        var transfer_amount = amountFormat(inputs[address]) + ' <b>' + getApi()['ticker'] + '</b>'

        content = `
            <a class="list-group-item list-group-item-action" href="#/address/${address}">
                <span class="entypo up text-danger"></span>
                <span class="text-primary">${address}</span>
                <small class="float-right text-muted">
                    <span class="text-monospace">${transfer_amount}</span>
                </small>
            </a>`

        status.from += content
    }

    data.vout.forEach(function(vout, index) {
        if (vout.value != undefined) {
            if (vout.scriptPubKey.addresses != undefined) {
                var address = vout.scriptPubKey.addresses[0]

                if (address in outputs) {
                    outputs[address] += vout.value
                } else {
                    outputs[address] = vout.value
                }
            }

            status.output += vout.value
        }
    })

    for (address in outputs) {
        var transfer_amount = amountFormat(outputs[address]) + ' <b>' + getApi()['ticker'] + '</b>'

        content = `
            <a class="list-group-item list-group-item-action" href="#/address/${address}">
                <span class="entypo down text-success"></span>
                <span class="text-primary">${address}</span>
                <small class="float-right text-muted">
                    <span class="text-monospace">${transfer_amount}</span>
                </small>
            </a>`

        status.to += content
    }

    if (!status.coinbase) {
        status.fee = status.input - status.output
        content = `
            <li class="list-group-item">
                <b>Total fee:</b>
                <small class="float-right text-muted">
                    <span class="text-monospace">${amountFormat(status.fee)}</span> <b>${getApi()['ticker']}</b>
                </small>
            </li>`

        status.to += content
    }

    if (status.coinbase) {
        status.badge.text = 'Coinbase'
        status.badge.class = 'badge-primary'
    }

    return status
}

function loadTransactions(holder) {
    holder.find('[data-transaction][data-transaction-loaded=false]').each(function() {
        var tx = $(this)
        transactionInfo(tx.attr('data-transaction'), true).then(function(data) {
            if (data.error == undefined) {
                tx.find('.transaction-time').text(timeFormat(data.result.time)).removeClass('d-none')

                var status = parseTransactionDetails(data.result)

                if (status.hide) {
                    tx.addClass('d-none')
                } else {
                    tx.find('hr').removeClass('d-none')
                    tx.find('.transaction-from').removeClass('d-none')
                    tx.find('.transaction-to').removeClass('d-none')

                    tx.find('.transaction-badge .badge').text(status.badge.text).removeClass('d-none')
                    tx.find('.transaction-badge .badge').addClass(status.badge.class)
                    tx.find('.transaction-badge').removeClass('d-none')

                    tx.find('.transaction-from ul').append(status.from)
                    tx.find('.transaction-to ul').append(status.to)
                }

                tx.attr('data-transaction-loaded', true)
            }
        })
    })
}

function displayTransactions(holder, data, offset = 0) {
    var index = offset
    data.forEach(function(transaction) {
        content = `
            <div class="card mt-3 light-shadow" data-transaction="${transaction}" data-transaction-index="${index}" data-transaction-loaded="false">
                <div class="card-header">
                    Transaction: <a href="#/transaction/${transaction}">
                        ${transaction}
                    </a>
                    <span class="transaction-badge">
                        <span class="ml-1 badge"></span>
                    </span>
                    <div class="float-right">
                        <span class="transaction-time"></span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-12 transaction-from d-none">
                            <ul class="list-group mb-3">
                                <li class="list-group-item disabled">
                                    <b>Inputs</b>
                                </li>
                            </ul>
                        </div>
                        <div class="col-12 transaction-to d-none">
                            <ul class="list-group">
                                <li class="list-group-item disabled">
                                    <b>Outputs</b>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>`
        holder.append(content)
        index += 1
    })

    if (data.length > 0) {
        $('#more-block-transactions').removeClass('d-none')
    } else {
        $('#more-block-transactions').addClass('d-none')
    }

    loadTransactions(holder)
}

function displayTxVout(vout_list, fee = 0) {
    vout_list.forEach(function(vout, index) {
        if ($('#tx-vout-list').find(`[data-tx-vout-index="${index}"]`).length == 0) {
            if (vout.scriptPubKey.type != 'nulldata') {
                var content = `
                    <a href="#/address/${vout.scriptPubKey.addresses[0]}" data-tx-vout-index="${vout.vout_index}" class="list-group-item list-group-item-action flex-column align-items-start">
                        <div class="row">
                            <div class="col-md-9 col-sm-12 col-xs-12">
                                <span class="text-muted mr-1">
                                    <span class="entypo down text-success"></span>
                                </span>
                                <span class="text-primary">${vout.scriptPubKey.addresses[0]}</span>
                            </div>
                            <div class="col-md-3 col-sm-12 col-xs-12 text-md-right">
                                <small class="text-muted">
                                    <span class="text-monospace">${amountFormat(vout.value)}</span> <b>${getApi()['ticker']}</b>
                                </small>
                            </div>
                        </div>
                    </a>`

                $('#tx-vout-list').append(content)
            } else {
                var content = `
                    <li class="list-group-item">
                        <code>${vout.scriptPubKey.asm}</code>
                    </li>
                `

                $('#tx-vout-list').append(content)
            }
        }
    })

    if (fee > 0) {
        $('#tx-vout-list').append(`
            <li class="list-group-item">
                <b>Total fee:</b>
                <small class="float-right text-muted">
                    <span class="text-monospace">${amountFormat(fee)}</span> <b>${getApi()['ticker']}</b>
                </small>
            </li>
        `)
    }
}

function displayTxVin(vin_list) {
    var total = $('#tx-info-vin-total .card-header b').text()
    vin_list.forEach(function(vin, index) {
        if (vin['coinbase'] != undefined) {
            $('#tx-vin-list').append('Newly Generated Coins (<b>Coinbase Transaction</b>)')
        } else {
            if ($('#tx-vin-list').find(`[data-tx-vin-index="${index}"]`).length == 0) {
                var content = `
                <div class="list-group-item flex-column align-items-start" data-tx-vin-index="${vin.vin_index}">
                    <div class="row">
                        <div class="col-md-9 col-sm-12 col-xs-12">
                            <span class="text-muted mr-1">
                                <span class="entypo up text-danger"></span>
                            </span>
                            <a href="#/address/${vin.scriptPubKey.addresses[0]}">
                                ${vin.scriptPubKey.addresses[0]}
                            </a>
                            (<a href="#/tx/${vin['txid']}">Output</a>)
                        </div>
                        <div class="col-md-3 col-sm-12 col-xs-12 text-md-right">
                            <small class="text-muted">
                                <span class="text-monospace">${amountFormat(vin.value)}</span> <b>${getApi()['ticker']}</b>
                            </small>
                        </div>
                    </div>
                </div>`

                $('#tx-vin-list').append(content)
            }
        }
    })
}

function displayHistory(address, history_list) {
    var total = $('#address-history .card-header b').text()
    history_list.forEach(function(tx_info, index) {
        if ($('#address-history-list').find(`[data-address-history-index="${tx_info.tx_index}"]`).length == 0) {
            var content = `
                <a href="#/tx/${tx_info.data.txid}" data-address-history-index="${tx_info.tx_index}" class="list-group-item list-group-item-action flex-column align-items-start">
                    <div class="row">
                        <div class="col-md-9 col-sm-12 col-xs-12">
                            <!-- <span class="text-muted mr-1">
                                <span class="entypo up text-danger"></span>
                            </span> -->
                            <span class="text-primary">${tx_info.data.txid}</span>
                        </div>
                        <div class="col-md-3 col-sm-12 col-xs-12 text-md-right">
                            <small class="text-muted">
                                ${tx_info.data.height > 0 ? '#' + tx_info.data.height : 'Mempool'}
                            </small>
                        </div>
                    </div>
                </a>`

            $('#address-history-list').append(content)
        }
    })
}

function displayHome() {
    $('#supply span').text('Loading...')
    networkInfo().then(function(data) {
        var height = data.result.blocks
        var display_height = Number($('#blocks-table tbody tr:first-child').attr('data-height'))

        circulatingSupply = parseInt(amountFormat(data.result.supply))
        $('#supply span').text(circulatingSupply.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ' + getApi()['ticker']);

        if (height != display_height || $('#blocks-table tbody tr').length > 0) {
            getBlocks(height).then(function(blocks) {
                if (blocks['error'] == undefined) {
                    displayBlocks(blocks['result'], true)

                    var chart_data = {
                        'diffs': [],
                        'blocks': [],
                        'sizes': [],
                        'timestamps': [],
                        'txs': [],
                        'nethash': []
                    }

                    $.each(blocks['result'].reverse(), function(index, block) {
                        chart_data['diffs'].push(block['difficulty'])
                        chart_data['blocks'].push(block['height'])
                        chart_data['sizes'].push(block['size'])
                        chart_data['timestamps'].push(block['time'])
                        chart_data['txs'].push(block['txcount'])
                        chart_data['nethash'].push(block['nethash'])
                    })

                    showCharts(chart_data)
                } else {
                    showError(errorMessages['blocks-load-error'])
                }
            })
        }
    })
}

// Set cookie
function setCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toGMTString();
    } else {
        expires = '';
    }
    document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expires + '; path=/';
}

// Read cookie
function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

// Check if variable is number lol
function isNumeric(num){
    return !isNaN(num)
}

// Convert satoshis to readable amount
function amountFormat(amount) {
    var decimals = getApi()['decimals']
    return parseFloat((amount / Math.pow(10, decimals)).toFixed(decimals))
}

// Convert timestamp to readable date
function timeFormat(timestamp) {	 
    var months_arr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    var date = new Date(timestamp * 1000)
    var year = date.getFullYear()
    var month = months_arr[date.getMonth()]
    var day = date.getDate()
    var hours = date.getHours()
    var minutes = '0' + date.getMinutes()
    var seconds = '0' + date.getSeconds()
    var convdataTime = month + '-' + day + '-' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)

    return convdataTime
}

// Show big error message at the top of the page :D 
function showError(message) {
    $('#error-message').text(message)
    $('#error-message').removeClass('d-none')
    setTimeout(function() {
        $('#error-message').addClass('d-none')
    }, 3400);
}

// Decode base58 encoded string to byte array
function base58Data(string) {
    bs58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    var bs58AlphabetMap = {}
    var base = bs58Alphabet.length
    var leader = bs58Alphabet.charAt(0)

    for (var i = 0; i < bs58Alphabet.length; i++) {
        bs58AlphabetMap[bs58Alphabet.charAt(i)] = i
    }

    if (string.length === 0) return []

    var bytes = [0]
    for (var i = 0; i < string.length; i++) {
        var value = bs58AlphabetMap[string[i]]
        if (value === undefined) throw new Error('Non-base' + base + ' character')

        var carry = bytes[0] * base + value
        bytes[0] = carry & 0xff
        carry >>= 8

        for (var j = 1; j < bytes.length; ++j) {
            carry += bytes[j] * base
            bytes[j] = carry & 0xff
            carry >>= 8
        }

        while (carry > 0) {
            bytes.push(carry & 0xff)
            carry >>= 8
        }
    }

    for (var k = 0; string[k] === leader && k < string.length - 1; ++k) {
        bytes.push(0)
    }

    return bytes.reverse()
}

function bech32Decode(bechString) {
    var charset = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

    var p;
    var has_lower = false;
    var has_upper = false;

    for (p = 0; p < bechString.length; ++p) {
        if (bechString.charCodeAt(p) < 33 || bechString.charCodeAt(p) > 126) {
            return null;
        }
        if (bechString.charCodeAt(p) >= 97 && bechString.charCodeAt(p) <= 122) {
            has_lower = true;
        }
        if (bechString.charCodeAt(p) >= 65 && bechString.charCodeAt(p) <= 90) {
            has_upper = true;
        }
    }

    if (has_lower && has_upper) {
        return null;
    }

    bechString = bechString.toLowerCase();
    var pos = bechString.lastIndexOf('1');
    if (pos < 1 || pos + 7 > bechString.length || bechString.length > 90) {
        return null;
    }

    var hrp = bechString.substring(0, pos);
    var data = [];
    for (p = pos + 1; p < bechString.length; ++p) {
        var d = charset.indexOf(bechString.charAt(p));
        if (d === -1) {
            return null;
        }
        data.push(d);
    }

    return {
        'hrp': hrp,
        'data': data.slice(0, data.length - 6)
    };
}

function convertBits(data, frombits, tobits, pad) {
    var acc = 0;
    var bits = 0;
    var ret = [];
    var maxv = (1 << tobits) - 1;
    for (var p = 0; p < data.length; ++p) {
        var value = data[p];
        if (value < 0 || (value >> frombits) !== 0) {
            return null;
        }
        acc = (acc << frombits) | value;
        bits += frombits;
        while (bits >= tobits) {
            bits -= tobits;
            ret.push((acc >> bits) & maxv);
        }
    }
    if (pad) {
        if (bits > 0) {
            ret.push((acc << (tobits - bits)) & maxv);
        }
    } else if (bits >= frombits || ((acc << (tobits - bits)) & maxv)) {
        return null;
    }
    return ret;
}

function bech32Data(addr) {
    var hrp = getApi()['hrp']
    var dec = bech32Decode(addr)
    if (dec === null || dec.hrp !== hrp || dec.data.length < 1 || dec.data[0] > 16) {
        return null
    }

    var res = convertBits(dec.data.slice(1), 5, 8, false)
    if (res === null || res.length < 2 || res.length > 40) {
        return null
    }

    if (dec.data[0] === 0 && res.length !== 20 && res.length !== 32) {
        return null
    }

    return {'version': dec.data[0], 'program': res}
}

// Convert byte array to hex sting
function hexString(byteArray) {
    return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

function hash160(string) {
    try {
        var result = hexString(base58Data(string)) 
        return result.substring(2, result.length - 8)
    } catch {
        var result = hexString(bech32Data(string).program) 
        return result
    }
}

function initRouter() {
    routePage()
    window.router = false
    $(window).on('hashchange', routePage)
    if (window.location.hash) {
        if (window.router) {
            $(window).trigger('hashchange')
        }
        window.router = true
    }
}

// All starts here
$(document).ready(function() {
    initRouter()
    displayNetworks()

    $('#supply').click(function() {
        displayHome()
    })

    $('#more').click(function() {
        var height = Number($('tr[data-height]').last().attr('data-height'))
        getBlocks(height).then(function(blocks) {
            if (blocks['error'] == undefined) {
                displayBlocks(blocks['result'])
            }
        })
    })

    $('#more-block-transactions').click(function() {
        var data_block_hash = $('#block-info-hash').text()
        var offset = Number($('#block-transactions [data-transaction-index]').last().attr('data-transaction-index')) + 1
        blockInfo(data_block_hash, offset).then(function(data) {
            if (data.error == undefined) {
                if (data.result.txcount > 10 && data.result.tx.length >= 10) {
                    $(this).removeClass('d-none')
                } else {
                    $(this).addClass('d-none')
                }

                displayTransactions($('#block-transactions'), data.result.tx, offset)
            }
        })
    })

    $('#more-address-transactions').click(function() {
        var data_address_link = $('#data-address').attr('data-address')
        var offset = Number($('#address-transactions [data-transaction-index]').last().attr('data-transaction-index')) + 1
        addressHistory(data_address_link, offset).then(function(data) {
            if (data.error == undefined) {
                if (data.result.txcount > 10 && data.result.tx.length >= 10) {
                    $(this).removeClass('d-none')
                } else {
                    $(this).addClass('d-none')
                }

                displayTransactions($('#address-transactions'), data.result.tx, offset)
            }
        })
    })

    $('#search-form').submit(function(e) {
        var search = $('#search-form input').val().trim()

        if (search != '') {
            if (isNumeric(search)) {
                switchPage('height', [search])
            } else {
                if (search.length == 64) {
                    blockInfo(search).then(function(data) {
                        if (data.error == undefined) {
                            switchPage('block', [search])
                        } else {
                            switchPage('transaction', [search])
                        }
                    })
                } else if (search.length == 34 || search.substring(0, 5) == getApi()['hrp']) {
                    switchPage('address', [search])
                } else {
                    showError(errorMessages['search-error'])
                }
            }
        }

        $('#search-form input').val('')
        e.preventDefault()
    })

    window.setInterval(function() {
        displayHome()
    }, 10000);
})