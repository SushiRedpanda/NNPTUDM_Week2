// console.log("Start");
// setTimeout(
//     function () {
//         console.log("Step 1")
//         setTimeout(
//             function () {
//                 console.log("Step 2")
//                 setTimeout(
//                     function () {
//                         console.log("Finish")
//                     }, 1000
//                 )
//             }, 1000
//         )
//     }, 1000
// )

//callback - hell

// let promise = new Promise(
//     function(resolve, reject){
//         let num = Math.floor(Math.random()*50)
//         if(num % 2 == 0) 
//             resolve(num)
//         else    reject(num)
//     }
// )

// promise.then(
//     function(data){
//         console.log("Thành công", data)
//     }
// ).catch(
//     function(data){
//         console.log("Thất bại", data)
//     }
// )

// let promise = new Promise(
//     function(resolve, reject){
//         //random ra 1 so tu 0-50 neu le thi resolve, nguoc lai thi reject
//         let num = Math.floor(Math.random()*50);
//         if(num % 2 ==0 ) resolve(num);
//         reject(num);
//     }
// )
// promise.then(
//     function(data){
//         console.log("Thanh cong", data)
//         return new Promise(
//             function(resolve, reject){
//                 if(data*2%2){
//                     resolve(data*2);
//                 }else{
//                     reject(data*2);
//                 }
//             }
//         )
//     }
// ).then(
//     function(data){
//         console.log("Thanh cong", data)
//     }
// ).then(
//     function(data){
//         console.log("Thanh cong", data)
//     }
// ).then(
//     function(data){
//         console.log("Thanh cong", data)
//     }
// ).then(
//     function(data){
//         console.log("Thanh cong", data)
//     }
// ).catch(
//     function(data){
//         console.log("That bai", data)
//     }
// )

//HTTP REQUEST

// function GetData() {
//     fetch('http://jsonplaceholder.typicode.com/posts/1').then(
//         function (res) {
//             return res.json()
//         }
//     ).then(function (data) {
//         console.log(data)
//     })
// }

async function GetData() {
    let res = await fetch("http://localhost:3000/posts");
    let data = await res.json();
    let body_of_table = document.getElementById('table-body');
    body_of_table.innerHTML = "";
    for (const i of data) {
        body_of_table.innerHTML +=
            `<tr>
            <td>${i.id}</td>
            <td>${i.title}</td>
            <td>${i.views}</td>
            <td><button onClick = "Delete(${i.id})">Delete</button></td>
        </tr> `
    }
}
async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("views_txt").value;

    // Kiểm tra ID có tồn tại không
    let checkRes = await fetch(`http://localhost:3000/posts/${id}`);
    let method = checkRes.ok ? "PUT" : "POST";
    let url = checkRes.ok ? `http://localhost:3000/posts/${id}` : 'http://localhost:3000/posts';

    let res = await fetch(url,
        {
            method: method,
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                title: title,
                views: views
            })
        }
    );
    if (res.ok) {
        console.log(method === "PUT" ? "Cập nhật thành công" : "Thêm mới thành công");
        GetData();
    } else {
        console.log("Lỗi khi lưu");
    }
}

async function Delete(id){

    let res = await fetch(`http://localhost:3000/posts/${id}`,
        {
            method: "DELETE",
            headers: {
                "Content-type": "application/json"
            }
        }
    );
    if (res.ok) {
        console.log("Xóa thành công");
    } else {
        console.log("Lỗi khi xóa");
    }
}

GetData()