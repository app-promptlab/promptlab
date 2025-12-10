import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Pegue essas chaves no painel do Supabase > Project Settings > API
// Ou configure no arquivo .env do supabase, mas vamos pegar do ambiente
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

// Configure seus IDs da Kiwify aqui
const PRODUTO_PROMPTS_ID = 'e2d15100-d5b9-11f0-a46e-6df3cad16a69'
const PRODUTO_GERADOR_ID = 'ffe055c0-d5be-11f0-b866-8d923b008dd6'

console.log("Iniciando Webhook Kiwify...")

serve(async (req) => {
  try {
    // 1. Apenas aceita POST
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const data = await req.json()
    const { order_status, Product } = data
    
    // Verifica se os dados essenciais vieram
    if (!data.Customer) {
        return new Response(JSON.stringify({ message: 'Dados inválidos' }), { headers: { "Content-Type": "application/json" }, status: 400 })
    }

    const customerEmail = data.Customer.email
    const customerName = data.Customer.full_name
    const productId = Product.product_id

    // 2. Só processa se estiver PAGO
    if (order_status !== 'paid') {
      return new Response(JSON.stringify({ message: 'Pedido não pago' }), { headers: { "Content-Type": "application/json" }, status: 200 })
    }

    // Criar cliente Supabase com permissão ADMIN
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 3. Verificar/Criar Usuário
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    let userId = users?.find(u => u.email === customerEmail)?.id

    if (!userId) {
        console.log(`Criando usuário novo: ${customerEmail}`)
        const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1@'
        
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: customerEmail,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: customerName }
        })

        if (createError) {
             console.error("Erro ao criar user:", createError)
             throw createError
        }
        userId = newUser.user.id
    }

    // 4. Definir acessos
    const updates: any = {}
    if (productId === PRODUTO_PROMPTS_ID) updates.has_prompts = true
    if (productId === PRODUTO_GERADOR_ID) updates.has_generators = true

    // 5. Atualizar perfil
    const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', userId)

    if (updateError) {
        console.error("Erro ao atualizar profile:", updateError)
        // Se falhar o update, tenta insert (caso o trigger tenha falhado)
        await supabaseAdmin.from('profiles').upsert({ id: userId, email: customerEmail, ...updates })
    }

    return new Response(JSON.stringify({ message: 'Sucesso!' }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
})