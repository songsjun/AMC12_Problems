# 2018 AMC 12A Problem 2

## Problem
While exploring a cave, Carl comes across a collection of 5-pound rocks worth \$14 each, 4-pound rocks worth \$11 each, and 1-pound rocks worth \$2 each. There are at least 20 of each size. He can carry at most 18 pounds. What is the maximum value, in dollars, of the rocks he can carry out of the cave?

$\textbf{(A) } 48 \qquad \textbf{(B) } 49 \qquad \textbf{(C) } 50 \qquad \textbf{(D) } 51 \qquad \textbf{(E) } 52$
## Solution 1
The value of 5-pound rocks is \$\div5=\$2.80 per pound, and the value of 4-pound rocks is \$\div4=\$2.75 per pound. Clearly, Carl should not carry more than three 1-pound rocks. Otherwise, he can replace some 1-pound rocks with some heavier rocks, preserving the weight but increasing the total value.

We perform casework on the number of 1-pound rocks Carl can carry:

$$
\begin{array}{c|c|c||c} & & & \\ [-2.5ex] \boldsymbol{1}\textbf{-Pound Rocks} & \boldsymbol{4}\textbf{-Pound Rocks} & \boldsymbol{5}\textbf{-Pound Rocks} & \textbf{Total Value} \\ \textbf{(}\boldsymbol{\$2}\textbf{ Each)} & \textbf{(}\boldsymbol{\$11}\textbf{ Each)} & \textbf{(}\boldsymbol{\$14}\textbf{ Each)} & \\ [0.5ex] \hline & & & \\ [-2ex] 0 & 2 & 2 & \$50 \\ & & & \\ [-2.25ex] 1 & 3 & 1 & \$49 \\ & & & \\ [-2.25ex] 2 & 4 & 0 & \$48 \\ & & & \\ [-2.25ex] 3 & 0 & 3 & \$48 \end{array}
$$

Clearly, the maximum value of the rocks Carl can carry is $\boxed{\textbf{(C) } 50}$ dollars.

**Remark**

Note that an upper bound of the total value is \$\cdot18=\$50.40, from which we can eliminate choices $\textbf{(D)}$ and $\textbf{(E)}.$

*~Pyhm2017 (Fundamental Logic)*

*~MRENTHUSIASM (Reconstruction)*
## Solution 2
Since each rock is worth 1 dollar less than 3 times its weight (in pounds), the answer is just $3\cdot 18=54$ minus the minimum number of rocks we need to make 18 pounds. Note that we need at least 4 rocks (two 5-pound rocks and two 4-pound rocks) to make 18 pounds, so the answer is $54-4=\boxed{\textbf{(C) } 50}.$

*~Kevindujin (Solution)*

*~MRENTHUSIASM (Revision)*
## Video Solution 1
https://youtu.be/mTf6Nz4rKjw

*~Education, the Study of Everything*
## See Also
