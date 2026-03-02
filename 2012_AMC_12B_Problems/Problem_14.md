# 2012 AMC 12B Problem 14

## Problem
Bernardo and Silvia play the following game. An integer between 0 and 999 inclusive is selected and given to Bernardo. Whenever Bernardo receives a number, he doubles it and passes the result to Silvia. Whenever Silvia receives a number, she adds 50 to it and passes the result to Bernardo. The winner is the last person who produces a number less than 1000. Let N be the smallest initial number that results in a win for Bernardo. What is the sum of the digits of N?

$\textbf{(A)}\ 7\qquad\textbf{(B)}\ 8\qquad\textbf{(C)}\ 9\qquad\textbf{(D)}\ 10\qquad\textbf{(E)}\ 11$
## Solution
### Solution 1
The last number that Bernardo says has to be between 950 and 999. Note that $1\rightarrow 2\rightarrow 52\rightarrow 104\rightarrow 154\rightarrow 308\rightarrow 358\rightarrow 716\rightarrow 766$ contains 4 doubling actions. Thus, we have x $\rightarrow 2x \rightarrow 2x+50 \rightarrow 4x+100 \rightarrow 4x+150 \rightarrow 8x+300 \rightarrow 8x+350 \rightarrow 16$x+700.

Thus, $950<16x+700<1000$. Then, $16x>250 \implies$ x $\geq 16.$

Because we are looking for the smallest integer x, $x=16$. Our answer is $1+6=\boxed{7},$ which is A.

*~minor edits by [https://artofproblemsolving.com/wiki/index.php/User:Kevinchen_yay KevinChen_Yay]*

*~removed unnecessary last step (EvanDu168)*
### Solution 2
Work backwards. The last number Bernardo produces must be in the range [950,999]. That means that before this, Silvia must produce a number in the range [475,499]. Before this, Bernardo must produce a number in the range [425,449]. Before this, Silvia must produce a number in the range [213,224]. Before this, Bernardo must produce a number in the range [163,174]. Before this, Silvia must produce a number in the range [82,87]. Before this, Bernardo must produce a number in the range [32,37]. Before this, Silvia must produce a number in the range [16,18]. Silvia could not have added 50 to any number before this to obtain a number in the range [16,18], hence the minimum N is 16 with the sum of digits being $\boxed{\textbf{(A)}\ 7}.$
### Solution 3
If our first number is N, then the sequence of numbers will be 2N,~2N+50,~4N+100,~4N+150,~8N+300,~8N+350,~16N+700,~16N+750 Note that we cannot go any further because doubling gives an extra 1500 at the end, which is already greater than 1000. The smallest N will be given if 16N+$750>1000>16N+700 \implies 15$ Since the problem asks for the smallest possible value of N, we get 16, and the sum of its digits is $1+6=\boxed{\textbf{(A)}~7}$ ~ 1001
## See Also
