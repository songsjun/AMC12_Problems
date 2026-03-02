# 2011 AMC 12B Problem 13

## Problem
Brian writes down four integers w > x > y > z whose sum is 44. The pairwise positive differences of these numbers are 1, 3, 4, 5, 6 and 9. What is the sum of the possible values of w?

$\textbf{(A)}\ 16 \qquad \textbf{(B)}\ 31 \qquad \textbf{(C)}\ 48 \qquad \textbf{(D)}\ 62 \qquad \textbf{(E)}\ 93$
## Solution
Assume that y-z=a, x-y=b, w-x=c.
w-z results in the greatest pairwise difference, and thus it is 9.
This means a+b+$c=9$. a,b,c must be in the set {1,3,4,5,6}.
The only way for 3 numbers in the set to add up to 9 is if they are 1,3,5.
a+b, and b+c then must be the remaining two numbers which are 4 and 6.
The ordering of (a,b,c) must be either (3,1,5) or (5,1,3).


$$
\begin{align*} z + (z + a) + (z + (a + b)) + (z + (a + b + c)) &= 4z + a + (a + b) + 9\\ 4z + a + (a + b) + 9 &= 44\\ \text{if} \hspace{1cm} a &= 3 \\ a + b &= 4\\ 4z &= 44 - 9 - 3 - 4\\ z &= 7\\ w &= 16\\ \end{align*}
$$


$$
\begin{align*} \text{if} \hspace{1cm} a &= 5\\ a + b &= 6\\ 4z &= 44 - 9 - 5 - 6\\ z &= 6\\ w &= 15\\ \end{align*}
$$


The sum of the two w's is $15+16=31\boxed{B}$
## Solution 2
Let the four numbers be z, z+a, z+b, and z+c. We know that c must be 9 because that's the greatest difference. So we have z, z+a, z+b, and $z+9$. The 6 possible differences are a, b, 9, b-a, 9-a, and 9-b. We are given that the differences are 1, 3, 4, 5, 6, 9. a and 9-a and b and 9-b add to 9 which means they have to be 4, 5 and 3,6 or vice versa. Which leaves 1. That means b-a has to equal 1. So a and b have to be 3,4, 4,5, or 5,6. For 3,4, we have z, $z+3, z+4$, and $z+9. 4z+16=44. 4z=28. z=7. w=7+9=16$. Now for 4,5, notice that it doesn't work. The differences are 4, 5, 9, 1, 4, 5. We are missing 6 and 3. For 5,6, it's z, $z+5, z+6$, and $z+9$. Check that the differences work; they do. We have 4$z+20=44. 4z=24. z=6. w=6+9=15$. Therefore our answer is $15+16=\boxed{31}.$
*~MC413551*
## See also
