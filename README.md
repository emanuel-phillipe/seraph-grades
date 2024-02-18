# Seraphix Grades API (S-Grades)
A plataforma S-Grades ajuda os usuários a ter um controle de suas atividades, notas, avaliações, e suas respectivas datas. Este repositório contém o projeto back-end da plataforma.

## Tecnologias
- NodeJS;
- ExpressJS;
- MongoDB.

## Rotas API

> /api/v1/user/register   (POST)

Registro de usuários
- Corpo de requisição JSON:
  
  ```
  {
    "name": "string and required",
    "nickname": "string and required",
    "school": "string and required",
    "email": "string, required and unique",
    "phone": "number and unique",
    "password": "string and required"
  }
  ```
- Usuário não pode estar autenticado.

<br>

> /api/v1/user/login   (POST)

Autenticação de usuários
- Corpo de requisição JSON:
  
  ```
  {
    "email": "string and required",
    "password": "string and required"
  }
  ```
- Usuário não pode estar autenticado.

<br>

> /api/v1/user/delete   (DELETE)

Remoção da conta do usuário
- Corpo de requisição JSON:
  
  ```
  {
    "name": "string and required",
    "email": "string and required",
    "password": "string and required"
  }
  ```
- Usuário precisa estar autenticado.

<br>

> /api/v1/user/logout   (POST)

Desautenticação do usuário
- Usuário precisa estar autenticado.
  
