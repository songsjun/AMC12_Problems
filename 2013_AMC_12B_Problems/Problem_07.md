# 2013 AMC 12B Problem 7

> This problem is the same as [2013 AMC 12B #7](https://artofproblemsolving.com/wiki/index.php/2013_AMC_12B_Problems) and [2013 AMC 10B #13](https://artofproblemsolving.com/wiki/index.php/2013_AMC_10B_Problems).
## Problem
Jo and Blair take turns counting from 1 to one more than the last number said by the other person. Jo starts by saying ``1", so Blair follows by saying ``1, 2". Jo then says ``1, 2, 3", and so on. What is the $53^{\text{rd}}$ number said?

$\textbf{(A)}\ 2 \qquad \textbf{(B)}\ 3 \qquad \textbf{(C)}\ 5 \qquad \textbf{(D)}\ 6 \qquad \textbf{(E)}\ 8$
## Solution
We notice that the number of numbers said is incremented by one each time; that is, Jo says one number, then Blair says two numbers, then Jo says three numbers, etc.  Thus, after nine "turns", $1+2+3+4+5+6+7+8+9=45$ numbers have been said.  In the tenth turn, the eighth number will be the 53rd number said, because $53-45=8$.  Since we are starting from 1 every turn, the 53rd number said will be $\boxed{\textbf{(E) }8}.$
## Faster Solution
We notice that the number of numbers said is incremented by one each time; that is, Jo says one number, then Blair says two numbers, then Jo says three numbers, etc.  We notice that the number of numbers is 1 + 2 + 3 + 4 ... every time we finish a "turn" we notice the sum of these would be the largest number $\frac{n(n+1)}{2}$ under 53, we can easily see that if we double this it'$s n^2 + n$ \simeq 106, and we immediately note that 10 is too high, but 9 is perfect, meaning that at 9, 45 numbers have been said so far, $\frac{9(9+1)}{2} = 45$ and 53 - $45 =\boxed{\textbf{(E) }8}$
## Solution 3
Let T(n) denote the nth triangle number. Then, observe that the T(n)th number said is n. It follows that the 55th number is 10 (as 55 = T(10)). Thus, the 53rd number is $10 - 2 = 8$, which is answer choice $\boxed{\textbf{(E)}}.$

*~Mathavi*
## Video Solution
https://youtu.be/a-3CAo4CoWc

*~no one*
## See also
