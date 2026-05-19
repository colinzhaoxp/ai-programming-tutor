import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed C -> Python assessment questions
  const questions = [
    {
      sourceLanguage: "C",
      targetLanguage: "Python",
      questionType: "choice",
      topic: "C variables",
      difficulty: "easy",
      question: "在 C 语言中，以下哪种方式可以声明一个整数变量？",
      options: JSON.stringify(["int x;", "integer x;", "var x;", "num x;"]),
      answer: "int x;",
      explanation:
        "C 语言使用明确的类型声明变量，如 int、float、char 等。",
    },
    {
      sourceLanguage: "C",
      targetLanguage: "Python",
      questionType: "choice",
      topic: "C arrays",
      difficulty: "easy",
      question:
        "在 C 语言中，数组名在大多数表达式中通常会退化为什么？",
      options: JSON.stringify([
        "数组长度",
        "指向首元素的指针",
        "结构体",
        "字符串",
      ]),
      answer: "指向首元素的指针",
      explanation:
        "C 语言数组名在大多数表达式中会退化为指向首元素的指针。",
    },
    {
      sourceLanguage: "C",
      targetLanguage: "Python",
      questionType: "choice",
      topic: "C pointers",
      difficulty: "medium",
      question: "在 C 语言中，以下哪种操作可以获取变量 x 的内存地址？",
      options: JSON.stringify(["*x", "&x", "x.address", "address(x)"]),
      answer: "&x",
      explanation: "在 C 语言中，& 运算符用于获取变量的内存地址。",
    },
    {
      sourceLanguage: "C",
      targetLanguage: "Python",
      questionType: "choice",
      topic: "C memory management",
      difficulty: "medium",
      question:
        "在 C 语言中，使用 malloc 分配的内存通常需要如何处理？",
      options: JSON.stringify([
        "自动释放",
        "使用 free 手动释放",
        "编译器释放",
        "不能释放",
      ]),
      answer: "使用 free 手动释放",
      explanation:
        "malloc 分配的堆内存需要程序员使用 free 手动释放。",
    },
    {
      sourceLanguage: "C",
      targetLanguage: "Python",
      questionType: "choice",
      topic: "C functions",
      difficulty: "easy",
      question: "在 C 语言中，函数参数默认是按什么方式传递的？",
      options: JSON.stringify([
        "按引用传递",
        "按值传递",
        "按指针传递",
        "按名称传递",
      ]),
      answer: "按值传递",
      explanation:
        "C 语言函数参数默认按值传递，即复制一份实参的值给形参。",
    },
    {
      sourceLanguage: "C",
      targetLanguage: "Python",
      questionType: "choice",
      topic: "C structs",
      difficulty: "medium",
      question: "在 C 语言中，struct 和 union 的主要区别是什么？",
      options: JSON.stringify([
        "struct 各成员共享内存，union 各成员独立内存",
        "struct 各成员独立内存，union 各成员共享内存",
        "没有区别",
        "struct 不能包含指针",
      ]),
      answer: "struct 各成员独立内存，union 各成员共享内存",
      explanation:
        "struct 的成员各自占用独立的内存空间，union 的所有成员共享同一块内存。",
    },
    {
      sourceLanguage: "C",
      targetLanguage: "Python",
      questionType: "choice",
      topic: "C compilation",
      difficulty: "easy",
      question: "C 语言程序在运行之前需要经过哪个过程？",
      options: JSON.stringify([
        "解释执行",
        "编译成机器码",
        "直接运行源代码",
        "转换成字节码",
      ]),
      answer: "编译成机器码",
      explanation:
        "C 语言是编译型语言，源代码需要先编译成机器码才能执行。",
    },
    {
      sourceLanguage: "C",
      targetLanguage: "Python",
      questionType: "choice",
      topic: "Python basics",
      difficulty: "easy",
      question: "Python 中变量的类型是在什么时候确定的？",
      options: JSON.stringify([
        "编译时",
        "声明时",
        "运行时赋值时",
        "需要预先声明",
      ]),
      answer: "运行时赋值时",
      explanation:
        "Python 是动态类型语言，变量类型在赋值时自动确定。",
    },
    {
      sourceLanguage: "C",
      targetLanguage: "Python",
      questionType: "choice",
      topic: "Python list",
      difficulty: "easy",
      question: "Python 的 list 和 C 的数组相比，最大的不同是什么？",
      options: JSON.stringify([
        "Python list 只能存储同一种类型",
        "Python list 长度固定",
        "Python list 可以动态扩展且可以存储不同类型",
        "Python list 不能遍历",
      ]),
      answer: "Python list 可以动态扩展且可以存储不同类型",
      explanation:
        "Python list 是动态的，可以随时添加删除元素，且可以存储不同类型的元素。",
    },
    {
      sourceLanguage: "C",
      targetLanguage: "Python",
      questionType: "text",
      topic: "C to Python migration",
      difficulty: "medium",
      question:
        "如果你熟悉 C 语言的指针，请简要说明你认为 Python 中是否有类似指针的概念？为什么？",
      answer: null,
      explanation:
        "Python 中所有变量都是对象的引用，类似于指针的概念，但不需要手动管理内存。",
    },
    {
      sourceLanguage: "C",
      targetLanguage: "Python",
      questionType: "text",
      topic: "C to Python migration",
      difficulty: "easy",
      question:
        "你学习过 C 语言的哪些方面？请简要描述你的编程经验。",
      answer: null,
      explanation: null,
    },
  ];

  for (const q of questions) {
    await prisma.assessmentQuestion.create({ data: q });
  }

  console.log(`Seeded ${questions.length} assessment questions`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
