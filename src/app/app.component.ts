import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface APIData {
  "id": number;
  "firstName": string;
  "lastName": string;
  "email": string;
  "nis": number;
  "_links":{
    "self":{
      "href": string;
    }
  }
}

interface ResponseData {
  "_embedded": {
    "funcionario": APIData[]
  };
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  inputs: ['ngForOf']
})
export class AppComponent {

  title = 'crud-ciss';
  firstName =  '';
  lastName =  '';
  email =  '';
  nis: number | null = null;
  addingFuncionario = false;
  currentFuncionario: APIData | null = null;
  searchQuery = '';
  patchURL: string | undefined;
  filteredData: APIData[] = [];
  resolvedData: APIData[] = [];

  data: ResponseData | undefined;
  constructor(private http: HttpClient){}

  checkformValidity(form: any){
    if(form.valid){
      return true;
    }
    if(form.controls.firstName.invalid){
      alert('O Primeiro Nome deve ter entre 2 e 30 caracteres');
    };
    if(form.controls.lastName.invalid){
      alert('O Sobrenome deve ter entre 2 e 50 caracteres');
    };
    if(form.controls.email.invalid){
      alert('O e-mail não pode estar vazio e deve serguir o padrão aaa@bbb.ccc')
    };
    if(form.controls.nis.invalid){
      alert('O NIS não pode estar vazio e deve ser um número')
    };
    return false;
  }

  search(){
    this.filteredData = this.resolvedData?.filter(item => {
      return Object.values(item).some(value =>
        value.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    });
  }

  openAddFuncionario(){
    this.addingFuncionario = !this.addingFuncionario;
    this.currentFuncionario = null;
  }
  
  addFuncionario(addForm: any){
    if(this.checkformValidity(addForm)){
      this.http.put('http://localhost:8080/funcionario/0', {"firstName": this.firstName, "lastName": this.lastName, "email": this.email, "nis": this.nis}).subscribe(() =>{
        window.location.reload();
        this.addingFuncionario = false;
      });
    }
  }

  editFuncionario(funcionario: APIData){
    this.currentFuncionario = funcionario;
    this.addingFuncionario = false;
  }

  updateFuncionario(patchDATA: APIData | null, editForm: any){
    this.patchURL = patchDATA?._links.self.href;
    if (this.patchURL && this.checkformValidity(editForm)){
      this.http.patch(this.patchURL, {"firstName": this.currentFuncionario?.firstName, "lastName": this.currentFuncionario?.lastName, "email": this.currentFuncionario?.email, "nis": this.currentFuncionario?.nis}).subscribe(()=>{
        window.location.reload();
        this.currentFuncionario = null;
      });
    }
    this.reloadTable();
  }

  cancelEdit() {
    this.currentFuncionario = null;
    window.location.reload();
  }

  deleteFuncionario(deleteURL: string){
    this.http.delete(deleteURL).subscribe(()=>{
      window.location.reload();
    });
  }

  reloadTable(){
    this.http.get('http://localhost:8080/funcionario').subscribe(response => {
      this.data = response as ResponseData
      this.resolvedData = this.data?._embedded?.funcionario
      this.filteredData = this.resolvedData;
    });
  }

  ngOnInit(){
    this.reloadTable();
  }
}
