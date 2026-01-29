//HTTP REQUEST GETALL GETONE PUT POST DELETE
const URL_REQUEST = 'http://localhost:3000/posts'
async function GetData() {
    try {
        let res = await fetch(URL_REQUEST);
        let posts = await res.json();
        
        let body_of_table = document.getElementById('table-body')
        body_of_table.innerHTML = "";
        for (const post of posts) {
            body_of_table.innerHTML +=
                `<tr>
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td><input type='submit' onclick='Delete(${post.id})' value='Delete'/></td>
            </tr>`
        }
    } catch (error) {
        console.log(error);
    }
}
// nếu id không tồn tai -> tạo mới
//id tồn tại thì sử dụng PATCH (update)
const URL_COMMENTS = 'http://localhost:3000/comments'

async function Save() {
    let id = document.getElementById("id_txt").value.trim();
    let title = document.getElementById("title_txt").value.trim();
    let views = document.getElementById("views_txt").value.trim();

    if (!title) {
        alert('Title is required');
        return false;
    }

    let res;

    if (id) {
        // try to update existing post (PATCH)
        const check = await fetch(URL_REQUEST + '/' + id);
        if (check.ok) {
            res = await fetch(URL_REQUEST + '/' + id, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title, views: views })
            });
        } else {
            // id provided but not exists => create with that id (string)
            res = await fetch(URL_REQUEST, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: String(id), title: title, views: views, isDeleted: false })
            });
        }
    } else {
        // maxId + 1 (Automaticaly maxId +1 if the text in Id field is empty)
        const all = await fetch(URL_REQUEST);
        const posts = await all.json();
        const maxId = posts.reduce((m, p) => Math.max(m, parseInt(p.id, 10) || 0), 0);
        const newId = String(maxId + 1);
        res = await fetch(URL_REQUEST, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: newId, title: title, views: views, isDeleted: false })
        });
    }

    if (!res || !res.ok) {
        console.log('bi loi');
    }

    clearPostForm();
    await GetData();
    await GetComments();
    return false;
}

async function SoftDeletePost(id) {
    const res = await fetch(URL_REQUEST + '/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: true })
    });
    if (res.ok) {
        console.log('soft deleted');
        await GetData();
    }
}

async function RestorePost(id) {
    const res = await fetch(URL_REQUEST + '/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: false })
    });
    if (res.ok) {
        console.log('restored');
        await GetData();
    }
}

function clearPostForm() {
    document.getElementById('id_txt').value = '';
    document.getElementById('title_txt').value = '';
    document.getElementById('views_txt').value = '';
}

// ---------- Comments CRUD ----------
async function GetComments() {
    try {
        const res = await fetch(URL_COMMENTS);
        const comments = await res.json();
        const tbody = document.getElementById('comments-table-body');
        tbody.innerHTML = '';
        for (const c of comments) {
            tbody.innerHTML += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.text}</td>
                    <td>${c.postId}</td>
                    <td>
                        <button onclick="editComment('${c.id}')">Edit</button>
                        <button onclick="deleteComment('${c.id}')">Delete</button>
                    </td>
                </tr>`;
        }
    } catch (err) { console.error(err); }
}

async function SaveComment() {
    const id = document.getElementById('comment_id').value.trim();
    const text = document.getElementById('comment_text').value.trim();
    const postId = document.getElementById('comment_post_select').value;
    if (!text || !postId) { alert('Comment text and post are required'); return false; }

    let res;
    if (id) {
        // update
        res = await fetch(URL_COMMENTS + '/' + id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, postId: String(postId) })
        });
    } else {
        // create with auto id + 1
        const all = await fetch(URL_COMMENTS);
        const comments = await all.json();
        const maxId = comments.reduce((m, c) => Math.max(m, parseInt(c.id, 10) || 0), 0);
        const newId = String(maxId + 1);
        res = await fetch(URL_COMMENTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: newId, text: text, postId: String(postId) })
        });
    }

    if (!res || !res.ok) { console.log('comment save error'); }
    clearCommentForm();
    await GetComments();
    return false;
}

function clearCommentForm() {
    document.getElementById('comment_id').value = '';
    document.getElementById('comment_text').value = '';
    document.getElementById('comment_post_select').selectedIndex = 0;
}

async function editComment(id) {
    const res = await fetch(URL_COMMENTS + '/' + id);
    if (!res.ok) { alert('Comment not found'); return; }
    const c = await res.json();
    document.getElementById('comment_id').value = c.id;
    document.getElementById('comment_text').value = c.text;
    document.getElementById('comment_post_select').value = c.postId;
}

async function deleteComment(id) {
    const res = await fetch(URL_COMMENTS + '/' + id, { method: 'DELETE' });
    if (res.ok) { await GetComments(); }
}

// Posts list dropdown
async function postsDropdown() {
    const select = document.getElementById('comment_post_select');
    if (!select) return;
    const res = await fetch(URL_REQUEST);
    const posts = await res.json();
    select.innerHTML = '';
    for (const p of posts) {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.id} - ${p.title}`;
        select.appendChild(opt);
    }
}

// Soft deleted post with red strike-through text and show the "Restorre" button 
async function GetData() {
    try {
        let res = await fetch(URL_REQUEST);
        let posts = await res.json();
        let body_of_table = document.getElementById('table-body')
        body_of_table.innerHTML = "";
        for (const post of posts) {
            const rowClass = post.isDeleted ? 'deleted' : '';
            const actions = post.isDeleted
                ? `<button onclick="RestorePost('${post.id}')">Restore</button> <button onclick=\"EditPost('${post.id}')\">Edit</button>`
                : `<button onclick="SoftDeletePost('${post.id}')">Delete</button> <button onclick=\"EditPost('${post.id}')\">Edit</button>`;

            body_of_table.innerHTML +=
                `<tr class="${rowClass}">
                    <td>${post.id}</td>
                    <td>${post.title}</td>
                    <td>${post.views}</td>
                    <td>${actions}</td>
                </tr>`;
        }

        // update post select for comments
        await postsDropdown();

    } catch (error) {
        console.log(error);
    }
}

// Loads edited post values into form
async function EditPost(id) {
    const res = await fetch(URL_REQUEST + '/' + id);
    if (!res.ok) { alert('Post not found'); return; }
    const p = await res.json();
    document.getElementById('id_txt').value = p.id;
    document.getElementById('title_txt').value = p.title;
    document.getElementById('views_txt').value = p.views;
}

//Load data
GetData();
GetComments();
