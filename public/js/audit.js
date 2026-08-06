$(function () {
    var PAGE_SIZE = 5;
    var currentPage = 1;

    var logs = [];
    try {
        logs = JSON.parse($('#auditLogsData').text() || '[]');
    } catch (e) {
        logs = [];
    }

    var filteredLogs = [];

    function applyFiltersAndRender() {
        var searchText = $('#auditSearch').val().trim().toLowerCase();
        var activityValue = $('#auditActivityFilter').val();
        var roleValue = $('#auditRoleFilter').val();
        var sortValue = $('#auditSort').val();

        filteredLogs = logs.filter(function (log) {
            var matchesSearch = !searchText ||
                (log.username || '').toLowerCase().includes(searchText) ||
                (log.activity || '').toLowerCase().includes(searchText);
            var matchesActivity = activityValue === 'all' || log.activity === activityValue;
            var matchesRole = roleValue === 'all' || log.userRole === roleValue;
            return matchesSearch && matchesActivity && matchesRole;
        });

        filteredLogs.sort(function (a, b) {
            var dateA = new Date(a.createdAt);
            var dateB = new Date(b.createdAt);
            return sortValue === 'oldest' ? dateA - dateB : dateB - dateA;
        });

        currentPage = 1;
        renderPage();
    }

    function renderPage() {
        var totalResults = filteredLogs.length;
        var totalPages = Math.max(Math.ceil(totalResults / PAGE_SIZE), 1);

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        var start = (currentPage - 1) * PAGE_SIZE;
        var pageItems = filteredLogs.slice(start, start + PAGE_SIZE);

        var $body = $('#auditLogsBody');
        $body.empty();

        if (pageItems.length === 0) {
            $body.append('<tr><td colspan="4" class="text-center text-muted py-4">No audit logs found.</td></tr>');
            $('#auditPrevBtn').prop('disabled', true);
            $('#auditNextBtn').prop('disabled', true);
            $('#auditPageInfo').text('');
            return;
        }

        pageItems.forEach(function (log) {
            var roleBadgeClass = log.userRole === 'admin' ? 'bg-danger' : 'bg-primary';
            var row = '<tr>' +
                '<td class="ps-4 text-muted small">' + escapeHtml(log.formattedDate) + '</td>' +
                '<td>' + escapeHtml(log.username) + '</td>' +
                '<td><span class="badge ' + roleBadgeClass + '">' + escapeHtml(log.userRole) + '</span></td>' +
                '<td>' + escapeHtml(log.activity) + '</td>' +
                '</tr>';
            $body.append(row);
        });

        $('#auditPageInfo').text('Page ' + currentPage + ' of ' + totalPages + ' (' + totalResults + ' result' + (totalResults === 1 ? '' : 's') + ')');
        $('#auditPrevBtn').prop('disabled', currentPage === 1);
        $('#auditNextBtn').prop('disabled', currentPage === totalPages);
    }

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    $('#auditSearch').on('input', applyFiltersAndRender);
    $('#auditActivityFilter').on('change', applyFiltersAndRender);
    $('#auditRoleFilter').on('change', applyFiltersAndRender);
    $('#auditSort').on('change', applyFiltersAndRender);

    $('#auditPrevBtn').on('click', function () {
        if (currentPage > 1) { currentPage--; renderPage(); }
    });
    $('#auditNextBtn').on('click', function () {
        currentPage++; renderPage();
    });

    applyFiltersAndRender();
});