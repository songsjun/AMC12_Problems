# 2004 AMC 12B Problem 12

> This problem is the same as [2004 AMC 12B #12](https://artofproblemsolving.com/wiki/index.php/2004_AMC_12B_Problems) and [2004 AMC 10B #19](https://artofproblemsolving.com/wiki/index.php/2004_AMC_10B_Problems).
## Problem
In the sequence 2001, 2002, 2003, $\ldots$ , each term after the third is found by subtracting the previous term from the sum of the two terms that precede that term. For example, the fourth term is $2001 + 2002 - 2003 = 2000$. What is the
$2004^\textrm{th}$ term in this sequence?


$$\mathrm{(A) \ } -2004 \qquad \mathrm{(B) \ } -2 \qquad \mathrm{(C) \ } 0 \qquad \mathrm{(D) \ } 4003 \qquad \mathrm{(E) \ } 6007$$

## Solution 1
We already know that $a_1=2001, a_2=2002, a_3=2003$, and $a_4=2000$. Let's compute the next few terms to get the idea how the sequence behaves. We get $a_5 = 2002+2003-2000 = 2005, a_6=2003+2000-2005=1998, a_7=2000+2005-1998=2007$, and so on.

We can now discover the following pattern: $a_{2k+1} = 2001+2k$ and $a_{2k}=2004-2k$. This is easily proved by induction. It follows that $a_{2004}=a_{2\cdot 1002} = 2004 - 2\cdot 1002 = \boxed{0}.$
## Solution 1 but in a more not smart way
Subtract 2000 from each of the terms so the sequence turns into 1, 2, 3, 0, 5, -2, 7, -4, 9, -6... ($1+2-3=0, 2+3-0=5$, 3+0-5=-2, 0+5-(-2)=7, 5+(-2)-7=-4, etc.). Quickly notice that after taking away 1 and 2, the 2nd term is 0, the 4th term is -2, the 6th term is -4, the 8th term is -6, etc. Thus, in the sequence without 1 and 2, the $(2n)$th term has a value of -$2(n-1)$. Therefore, to find the 2004th term in the original sequence, we take away the first 2 values to form the new sequence so the value of the 2004th term in the original sequence is the 2002nd term in the new sequence. 2002 is 2 times 1001. Thus, the value is -$2(1001-1)$= -2000. BUT, REMEMBER THAT AT THE START WE TOOK AWAY 2000 FROM EACH TERM. ADD -2000 TO 2000 TO GET $\boxed{0}. LOLOL$
## Solution 2
Note that the recurrence $a_n+a_{n+1}-a_{n+2}$~=~$a_{n+3}$ can be rewritten as $a_n+a_{n+1}$ ~=~ $a_{n+2}+a_{n+3}$.

Hence we get that $a_1+a_$2 ~=~ $a_3+a_$4 ~=~ $a_5+a_$6 ~= $\cdots$ and also
$$a_2+a_3 ~=~ a_4+a_5 ~=~ a_6+a_7 ~= \cdots$$

From the values given in the problem statement we see that $a_3=a_1+2$.

From $a_1+a_2 = a_3+a_4$ we get that $a_4=a_2-2$.

From $a_2+a_3 = a_4+a_5$ we get that $a_5=a_3+2$.

Following this pattern, we get $a_{2004}=a_{2002}-2 =a_{2000}-4 =\cdots =a_2 - 2002 =\boxed{0}.$
## Solution 3
Our recurrence is $a_n+a_{n+1}-a_{n+2}$~=~$a_{n+3}$, so we get $r^3+r^2-r-1 = 1$, so $(r-1)(r+1)^2 = 1$, so our formula for the recurrence is $a_n= A + (B + Cn)(-1)^n.$

Substituting our starting values gives us $a_n = 2002 + (2 - n)(-1)^n.$

$$So, a_{2004} = 2002 - 2002 = 0.$$
## See also
