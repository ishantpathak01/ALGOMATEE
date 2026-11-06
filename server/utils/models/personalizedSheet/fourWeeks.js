import CodingProblems from './../../../models/problems/Coding.js'

export const generateSheet=async({company,myLevel,commitmentLevel,topicsCovered, focusTopics})=>{
    let count = commitmentLevel==1?10:commitmentLevel==2?12:15;
    const weekOne = await weekOneSheet({company,myLevel,count,topicsCovered});
    const weekTwo = await weekTwoSheet();
    const weekThree = await weekThreeSheet();
    const weekFour = await weekFourSheet();
}


const difficultyRatio = {
    'A': { easy: 5, medium: 4, hard: 1 },
    'B':   { easy: 3, medium: 5, hard: 2 },
    'C': { easy: 1, medium: 5, hard: 4 }
  };


const weekOneSheet=async({company,myLevel,count,topicsCovered})={
    // get 10 questions easy,medium, hard from same company tag. ( if enough quest not found then get some random questions with tags topicsCovered. )


}

const weekTwoSheet=async()={

}

const weekThreeSheet=async()={

}
const weekFourSheet=async()={

}